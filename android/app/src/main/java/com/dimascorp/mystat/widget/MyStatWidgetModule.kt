package com.dimascorp.mystat.widget

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MyStatWidgetModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "MyStatWidgetModule"

  @ReactMethod
  fun syncWidgetData(payload: String, promise: Promise) {
    try {
      WidgetDataStore.savePayload(reactApplicationContext, payload)
      MyStatHomeWidgetProvider.refreshWidgets(reactApplicationContext)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("WIDGET_SYNC_FAILED", error)
    }
  }
}
