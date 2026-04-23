package com.dimascorp.mystat.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
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
      val minWidth = appWidgetManager.getAppWidgetOptions(appWidgetId).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
      val minHeight = appWidgetManager.getAppWidgetOptions(appWidgetId).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)
      val isExpandedLayout = minWidth >= 300 && minHeight >= 220
      val layoutId = if (isExpandedLayout) R.layout.my_stat_widget_large else R.layout.my_stat_widget
      val views = RemoteViews(context.packageName, layoutId)
      val openAppIntent = createActivityIntent(context, appWidgetId, null)
      val quickLogIntent = createActivityIntent(context, appWidgetId + 10_000, "mystat://app/quick-log")
      val radarSizeDp =
        if (isExpandedLayout) {
          min(max(min(minWidth - 36, minHeight - 84), 190), 252)
        } else {
          min(max(min(minWidth, minHeight), 166), 216)
        }
      val radarBitmap = WidgetRadarRenderer.createBitmap(context, payload, dp(context, radarSizeDp.toFloat()))

      views.setOnClickPendingIntent(R.id.widget_root, openAppIntent)
      views.setImageViewBitmap(R.id.widget_radar, radarBitmap)
      if (isExpandedLayout) {
        views.setOnClickPendingIntent(R.id.widget_quick_log_button, quickLogIntent)
      }

      if (payload == null) {
        views.setTextViewText(R.id.widget_total_score, context.getString(R.string.widget_placeholder_value))
        views.setTextViewText(R.id.widget_average_score, context.getString(R.string.widget_placeholder_value))
        views.setTextViewText(R.id.widget_helper_text, context.getString(R.string.widget_empty_helper))
        views.setTextViewText(R.id.widget_total_caption, context.getString(R.string.widget_total_caption))
        views.setTextViewText(R.id.widget_average_caption, context.getString(R.string.widget_average_caption))
        if (isExpandedLayout) {
          views.setTextViewText(R.id.widget_quick_log_button, context.getString(R.string.widget_quick_log_cta))
        }
      } else if (payload.cores.size < 3) {
        views.setTextViewText(R.id.widget_total_score, payload.totalScoreLabel)
        views.setTextViewText(R.id.widget_average_score, payload.averageScoreLabel)
        views.setTextViewText(
          R.id.widget_helper_text,
          context.getString(R.string.widget_partial_helper),
        )
        views.setTextViewText(R.id.widget_total_caption, context.getString(R.string.widget_total_caption))
        views.setTextViewText(R.id.widget_average_caption, context.getString(R.string.widget_average_caption))
        if (isExpandedLayout) {
          views.setTextViewText(R.id.widget_quick_log_button, context.getString(R.string.widget_quick_log_cta))
        }
      } else {
        views.setTextViewText(R.id.widget_total_score, payload.totalScoreLabel)
        views.setTextViewText(R.id.widget_average_score, payload.averageScoreLabel)
        views.setTextViewText(
          R.id.widget_helper_text,
          context.getString(
            R.string.widget_helper_format,
            payload.targetLabel,
          ),
        )
        views.setTextViewText(R.id.widget_total_caption, context.getString(R.string.widget_total_caption))
        views.setTextViewText(R.id.widget_average_caption, context.getString(R.string.widget_average_caption))
        if (isExpandedLayout) {
          views.setTextViewText(R.id.widget_quick_log_button, context.getString(R.string.widget_quick_log_cta))
        }
      }

      appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun createActivityIntent(
      context: Context,
      requestCode: Int,
      dataUri: String?,
    ): PendingIntent {
      val intent =
        Intent(context, MainActivity::class.java).apply {
          flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
          if (dataUri != null) {
            action = Intent.ACTION_VIEW
            data = Uri.parse(dataUri)
          }
        }

      return PendingIntent.getActivity(
        context,
        requestCode,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )
    }

    private fun dp(context: Context, value: Float): Int {
      return (value * context.resources.displayMetrics.density).toInt()
    }
  }
}
