package com.dimascorp.mystat.widget

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MyStatBackupModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private var pendingExportJson: String? = null
  private var pendingExportPromise: Promise? = null
  private var pendingImportPromise: Promise? = null

  private val activityEventListener =
    object : BaseActivityEventListener() {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
      ) {
        when (requestCode) {
          REQUEST_CREATE_BACKUP -> handleCreateBackupResult(resultCode, data)
          REQUEST_OPEN_BACKUP -> handleOpenBackupResult(resultCode, data)
        }
      }
    }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  override fun getName(): String = "MyStatBackupModule"

  @ReactMethod
  fun exportBackup(json: String, fileName: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "The app is not ready to open the file picker.")
      return
    }
    if (pendingExportPromise != null || pendingImportPromise != null) {
      promise.reject("BACKUP_BUSY", "Another backup operation is already in progress.")
      return
    }

    pendingExportJson = json
    pendingExportPromise = promise

    val intent =
      Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = BACKUP_MIME_TYPE
        putExtra(Intent.EXTRA_TITLE, fileName)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
      }

    try {
      activity.startActivityForResult(intent, REQUEST_CREATE_BACKUP)
    } catch (error: Exception) {
      clearExport()
      promise.reject("EXPORT_PICKER_FAILED", error)
    }
  }

  @ReactMethod
  fun importBackup(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "The app is not ready to open the file picker.")
      return
    }
    if (pendingExportPromise != null || pendingImportPromise != null) {
      promise.reject("BACKUP_BUSY", "Another backup operation is already in progress.")
      return
    }

    pendingImportPromise = promise

    val intent =
      Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE)
        type = "*/*"
        putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(BACKUP_MIME_TYPE, "text/plain", "application/octet-stream"))
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }

    try {
      activity.startActivityForResult(intent, REQUEST_OPEN_BACKUP)
    } catch (error: Exception) {
      clearImport()
      promise.reject("IMPORT_PICKER_FAILED", error)
    }
  }

  private fun handleCreateBackupResult(resultCode: Int, data: Intent?) {
    val promise = pendingExportPromise ?: return
    val json = pendingExportJson
    clearExport()

    if (resultCode != Activity.RESULT_OK) {
      promise.reject("EXPORT_CANCELLED", "Backup export was cancelled.")
      return
    }

    val uri = data?.data
    if (uri == null || json == null) {
      promise.reject("EXPORT_FAILED", "The selected backup file could not be opened.")
      return
    }

    try {
      reactApplicationContext.contentResolver.openOutputStream(uri, "wt").use { outputStream ->
        if (outputStream == null) {
          throw IllegalStateException("Backup file output stream is unavailable.")
        }
        outputStream.write(json.toByteArray(Charsets.UTF_8))
      }
      promise.resolve(uri.toString())
    } catch (error: Exception) {
      promise.reject("EXPORT_FAILED", error)
    }
  }

  private fun handleOpenBackupResult(resultCode: Int, data: Intent?) {
    val promise = pendingImportPromise ?: return
    clearImport()

    if (resultCode != Activity.RESULT_OK) {
      promise.reject("IMPORT_CANCELLED", "Backup import was cancelled.")
      return
    }

    val uri = data?.data
    if (uri == null) {
      promise.reject("IMPORT_FAILED", "The selected backup file could not be opened.")
      return
    }

    try {
      val json = readText(uri)
      promise.resolve(json)
    } catch (error: Exception) {
      promise.reject("IMPORT_FAILED", error)
    }
  }

  private fun readText(uri: Uri): String {
    return reactApplicationContext.contentResolver.openInputStream(uri).use { inputStream ->
      if (inputStream == null) {
        throw IllegalStateException("Backup file input stream is unavailable.")
      }
      inputStream.bufferedReader(Charsets.UTF_8).use { reader -> reader.readText() }
    }
  }

  private fun clearExport() {
    pendingExportJson = null
    pendingExportPromise = null
  }

  private fun clearImport() {
    pendingImportPromise = null
  }

  companion object {
    private const val REQUEST_CREATE_BACKUP = 5011
    private const val REQUEST_OPEN_BACKUP = 5012
    private const val BACKUP_MIME_TYPE = "application/json"
  }
}
