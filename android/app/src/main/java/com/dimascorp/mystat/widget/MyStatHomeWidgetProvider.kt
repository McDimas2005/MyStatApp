package com.dimascorp.mystat.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.dimascorp.mystat.MainActivity
import com.dimascorp.mystat.R

enum class WidgetVariant(
  val layoutId: Int,
) {
  Radar2x2(R.layout.my_stat_widget_radar_2x2),
  Pie2x2(R.layout.my_stat_widget_pie_2x2),
  RadarTotalAverage4x2(R.layout.my_stat_widget_radar_total_average_4x2),
  RadarAverageQuickLog4x2(R.layout.my_stat_widget_radar_average_quick_log_4x2),
  RadarScoreQuickLog4x3(R.layout.my_stat_widget_radar_score_quick_log_4x3),
  TargetProgress4x4(R.layout.my_stat_widget_target_progress_4x4),
  TotalProgress4x4(R.layout.my_stat_widget_total_progress_4x4),
}

abstract class BaseMyStatWidgetProvider(
  private val variant: WidgetVariant,
) : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    appWidgetIds.forEach { appWidgetId ->
      updateAppWidget(context, appWidgetManager, appWidgetId, variant)
    }
  }

  override fun onAppWidgetOptionsChanged(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetId: Int,
    newOptions: android.os.Bundle,
  ) {
    updateAppWidget(context, appWidgetManager, appWidgetId, variant)
  }

  companion object {
    private val providerClasses =
      listOf(
        MyStatRadar2x2WidgetProvider::class.java,
        MyStatPie2x2WidgetProvider::class.java,
        MyStatHomeWidgetProvider::class.java,
        MyStatRadarAverageQuickLog4x2WidgetProvider::class.java,
        MyStatRadarScoreQuickLog4x3WidgetProvider::class.java,
        MyStatTargetProgress4x4WidgetProvider::class.java,
        MyStatTotalProgress4x4WidgetProvider::class.java,
      )

    fun refreshWidgets(context: Context) {
      val appWidgetManager = AppWidgetManager.getInstance(context)
      providerClasses.forEach { providerClass ->
        val componentName = ComponentName(context, providerClass)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
        appWidgetIds.forEach { appWidgetId ->
          updateAppWidget(context, appWidgetManager, appWidgetId, variantForProvider(providerClass))
        }
      }
    }

    private fun updateAppWidget(
      context: Context,
      appWidgetManager: AppWidgetManager,
      appWidgetId: Int,
      variant: WidgetVariant,
    ) {
      val payload = WidgetDataStore.loadPayload(context)
      val views = RemoteViews(context.packageName, variant.layoutId)
      val openAppIntent = createActivityIntent(context, appWidgetId, null)
      val quickLogIntent = createActivityIntent(context, appWidgetId + 10_000, "mystat://app/quick-log")

      views.setOnClickPendingIntent(R.id.widget_root, openAppIntent)
      bindText(context, views, payload, variant)

      when (variant) {
        WidgetVariant.Radar2x2 -> {
          views.setImageViewBitmap(R.id.widget_radar, WidgetRadarRenderer.createBitmap(context, payload, dp(context, 184f)))
        }

        WidgetVariant.Pie2x2 -> {
          views.setImageViewBitmap(R.id.widget_chart, WidgetPieRenderer.createBitmap(context, payload, dp(context, 184f)))
        }

        WidgetVariant.RadarTotalAverage4x2 -> {
          views.setImageViewBitmap(R.id.widget_radar, WidgetRadarRenderer.createBitmap(context, payload, dp(context, 172f)))
        }

        WidgetVariant.RadarAverageQuickLog4x2 -> {
          views.setImageViewBitmap(R.id.widget_radar, WidgetRadarRenderer.createBitmap(context, payload, dp(context, 172f)))
          views.setOnClickPendingIntent(R.id.widget_quick_log_button, quickLogIntent)
        }

        WidgetVariant.RadarScoreQuickLog4x3 -> {
          views.setImageViewBitmap(R.id.widget_radar, WidgetRadarRenderer.createBitmap(context, payload, dp(context, 218f)))
          views.setOnClickPendingIntent(R.id.widget_quick_log_button, quickLogIntent)
        }

        WidgetVariant.TargetProgress4x4 -> {
          views.setImageViewBitmap(
            R.id.widget_chart,
            WidgetProgressRenderer.createTargetBitmap(context, payload, dp(context, 286f), dp(context, 286f)),
          )
        }

        WidgetVariant.TotalProgress4x4 -> {
          views.setImageViewBitmap(
            R.id.widget_chart,
            WidgetProgressRenderer.createTotalBitmap(context, payload, dp(context, 286f), dp(context, 286f)),
          )
        }
      }

      appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun bindText(
      context: Context,
      views: RemoteViews,
      payload: WidgetPayload?,
      variant: WidgetVariant,
    ) {
      val totalScore = payload?.totalScoreLabel ?: context.getString(R.string.widget_placeholder_value)
      val averageScore = payload?.averageScoreLabel ?: context.getString(R.string.widget_placeholder_value)

      when (variant) {
        WidgetVariant.RadarTotalAverage4x2,
        WidgetVariant.RadarScoreQuickLog4x3 -> {
          views.setTextViewText(R.id.widget_total_score, totalScore)
          views.setTextViewText(R.id.widget_total_caption, context.getString(R.string.widget_total_caption))
        }

        else -> Unit
      }

      when (variant) {
        WidgetVariant.RadarTotalAverage4x2,
        WidgetVariant.RadarAverageQuickLog4x2,
        WidgetVariant.RadarScoreQuickLog4x3 -> {
          views.setTextViewText(R.id.widget_average_score, averageScore)
          views.setTextViewText(R.id.widget_average_caption, context.getString(R.string.widget_average_caption))
        }

        else -> Unit
      }

      when (variant) {
        WidgetVariant.RadarAverageQuickLog4x2,
        WidgetVariant.RadarScoreQuickLog4x3 -> views.setTextViewText(R.id.widget_quick_log_button, context.getString(R.string.widget_quick_log_cta))

        else -> Unit
      }
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

    private fun variantForProvider(providerClass: Class<out BaseMyStatWidgetProvider>): WidgetVariant {
      return when (providerClass) {
        MyStatRadar2x2WidgetProvider::class.java -> WidgetVariant.Radar2x2
        MyStatPie2x2WidgetProvider::class.java -> WidgetVariant.Pie2x2
        MyStatRadarAverageQuickLog4x2WidgetProvider::class.java -> WidgetVariant.RadarAverageQuickLog4x2
        MyStatRadarScoreQuickLog4x3WidgetProvider::class.java -> WidgetVariant.RadarScoreQuickLog4x3
        MyStatTargetProgress4x4WidgetProvider::class.java -> WidgetVariant.TargetProgress4x4
        MyStatTotalProgress4x4WidgetProvider::class.java -> WidgetVariant.TotalProgress4x4
        else -> WidgetVariant.RadarTotalAverage4x2
      }
    }

    private fun dp(context: Context, value: Float): Int {
      return (value * context.resources.displayMetrics.density).toInt()
    }
  }
}

class MyStatRadar2x2WidgetProvider : BaseMyStatWidgetProvider(WidgetVariant.Radar2x2)

class MyStatPie2x2WidgetProvider : BaseMyStatWidgetProvider(WidgetVariant.Pie2x2)

class MyStatHomeWidgetProvider : BaseMyStatWidgetProvider(WidgetVariant.RadarTotalAverage4x2) {
  companion object {
    fun refreshWidgets(context: Context) {
      BaseMyStatWidgetProvider.refreshWidgets(context)
    }
  }
}

class MyStatRadarAverageQuickLog4x2WidgetProvider : BaseMyStatWidgetProvider(WidgetVariant.RadarAverageQuickLog4x2)

class MyStatRadarScoreQuickLog4x3WidgetProvider : BaseMyStatWidgetProvider(WidgetVariant.RadarScoreQuickLog4x3)

class MyStatTargetProgress4x4WidgetProvider : BaseMyStatWidgetProvider(WidgetVariant.TargetProgress4x4)

class MyStatTotalProgress4x4WidgetProvider : BaseMyStatWidgetProvider(WidgetVariant.TotalProgress4x4)
