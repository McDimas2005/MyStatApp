package com.dimascorp.mystat.widget

import android.content.Context
import android.graphics.Color
import org.json.JSONObject

private const val PREFS_NAME = "my_stat_widget"
private const val KEY_PAYLOAD = "widget_payload"

data class WidgetCore(
  val name: String,
  val label: String,
  val color: Int,
  val totalScore: Double,
)

data class WidgetPayload(
  val totalScore: Double,
  val averageScore: Double,
  val averageScoreTarget: Double,
  val totalScoreLabel: String,
  val averageScoreLabel: String,
  val targetLabel: String,
  val coreCount: Int,
  val compactNumbers: Boolean,
  val cores: List<WidgetCore>,
)

object WidgetDataStore {
  fun savePayload(context: Context, payload: String) {
    context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_PAYLOAD, payload)
      .apply()
  }

  fun loadPayload(context: Context): WidgetPayload? {
    val rawPayload =
      context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(KEY_PAYLOAD, null)
        ?: return null

    return try {
      val json = JSONObject(rawPayload)
      val coresArray = json.optJSONArray("cores")
      val cores = buildList {
        if (coresArray == null) {
          return@buildList
        }

        for (index in 0 until coresArray.length()) {
          val core = coresArray.optJSONObject(index) ?: continue
          add(
            WidgetCore(
              name = core.optString("name", "Core"),
              label = core.optString("label", "CORE"),
              color = parseColor(core.optString("color", "#0B3D91")),
              totalScore = core.optDouble("totalScore", 0.0),
            )
          )
        }
      }

      WidgetPayload(
        totalScore = json.optDouble("totalScore", 0.0),
        averageScore = json.optDouble("averageScore", 0.0),
        averageScoreTarget = json.optDouble("averageScoreTarget", 0.0),
        totalScoreLabel = json.optString("totalScoreLabel", "0"),
        averageScoreLabel = json.optString("averageScoreLabel", "0"),
        targetLabel = json.optString("targetLabel", "0"),
        coreCount = json.optInt("coreCount", cores.size),
        compactNumbers = json.optBoolean("compactNumbers", true),
        cores = cores,
      )
    } catch (_: Exception) {
      null
    }
  }

  private fun parseColor(value: String): Int {
    return try {
      Color.parseColor(value)
    } catch (_: IllegalArgumentException) {
      Color.parseColor("#0B3D91")
    }
  }
}
