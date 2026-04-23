package com.dimascorp.mystat.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.RemoteViews
import com.dimascorp.mystat.MainActivity
import com.dimascorp.mystat.R
import kotlin.math.max
import kotlin.math.min

class MyStatHomeWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    appWidgetIds.forEach { appWidgetId ->
      updateAppWidget(context, appWidgetManager, appWidgetId)
    }
  }

  override fun onAppWidgetOptionsChanged(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
    newOptions: Bundle,
  ) {
    updateAppWidget(context, appWidgetManager, appWidgetId)
  }

  companion object {
    fun refreshWidgets(context: Context) {
      val appWidgetManager = AppWidgetManager.getInstance(context)
      val componentName = ComponentName(context, MyStatHomeWidgetProvider::class.java)
      val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
      appWidgetIds.forEach { appWidgetId ->
        updateAppWidget(context, appWidgetManager, appWidgetId)
      }
    }

    private fun updateAppWidget(
      context: Context,
      appWidgetManager: AppWidgetManager,
      appWidgetId: Int,
    ) {
      val payload = WidgetDataStore.loadPayload(context)
      val views = RemoteViews(context.packageName, R.layout.my_stat_widget)
      val launchIntent =
        PendingIntent.getActivity(
          context,
          appWidgetId,
          Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
          },
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

      val minWidth = appWidgetManager.getAppWidgetOptions(appWidgetId).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
      val minHeight = appWidgetManager.getAppWidgetOptions(appWidgetId).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)
      val radarSizeDp = min(max(min(minWidth, minHeight), 132), 188)
      val radarBitmap = WidgetRadarRenderer.createBitmap(context, payload, dp(context, radarSizeDp.toFloat()))

      views.setOnClickPendingIntent(R.id.widget_root, launchIntent)
      views.setImageViewBitmap(R.id.widget_radar, radarBitmap)

      if (payload == null) {
        views.setTextViewText(R.id.widget_total_score, context.getString(R.string.widget_placeholder_value))
        views.setTextViewText(R.id.widget_average_score, context.getString(R.string.widget_placeholder_value))
        views.setTextViewText(R.id.widget_helper_text, context.getString(R.string.widget_empty_helper))
        views.setTextViewText(R.id.widget_total_caption, context.getString(R.string.widget_total_caption))
        views.setTextViewText(R.id.widget_average_caption, context.getString(R.string.widget_average_caption))
        views.setTextViewText(R.id.widget_status_chip, context.getString(R.string.widget_status_empty))
      } else if (payload.cores.size < 3) {
        views.setTextViewText(R.id.widget_total_score, payload.totalScoreLabel)
        views.setTextViewText(R.id.widget_average_score, payload.averageScoreLabel)
        views.setTextViewText(
          R.id.widget_helper_text,
          context.getString(R.string.widget_partial_helper, payload.coreCount),
        )
        views.setTextViewText(R.id.widget_total_caption, context.getString(R.string.widget_total_caption))
        views.setTextViewText(R.id.widget_average_caption, context.getString(R.string.widget_average_caption))
        views.setTextViewText(R.id.widget_status_chip, context.getString(R.string.widget_status_partial))
      } else {
        views.setTextViewText(R.id.widget_total_score, payload.totalScoreLabel)
        views.setTextViewText(R.id.widget_average_score, payload.averageScoreLabel)
        views.setTextViewText(
          R.id.widget_helper_text,
          context.getString(
            R.string.widget_helper_format,
            payload.targetLabel,
            payload.coreCount,
          ),
        )
        views.setTextViewText(R.id.widget_total_caption, context.getString(R.string.widget_total_caption))
        views.setTextViewText(R.id.widget_average_caption, context.getString(R.string.widget_average_caption))
        views.setTextViewText(
          R.id.widget_status_chip,
          context.getString(R.string.widget_status_ready, payload.coreCount),
        )
      }

      appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun dp(context: Context, value: Float): Int {
      return (value * context.resources.displayMetrics.density).toInt()
    }
  }
}
