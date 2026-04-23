package com.dimascorp.mystat.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import kotlin.math.max
import kotlin.math.min

object WidgetProgressRenderer {
  fun createTargetBitmap(
    context: Context,
    payload: WidgetPayload?,
    widthPx: Int,
    heightPx: Int,
  ): Bitmap {
    return createBitmap(
      context = context,
      payload = payload,
      widthPx = widthPx,
      heightPx = heightPx,
      title = "CORE TARGET",
      valueProvider = { core ->
        val target = payload?.averageScoreTarget?.takeIf { it > 0.0 } ?: 0.0
        if (target <= 0.0) 0.0 else core.totalScore / target
      },
      labelProvider = { progress, _ -> "${(min(max(progress, 0.0), 1.0) * 100.0).toInt()}%" },
    )
  }

  fun createTotalBitmap(
    context: Context,
    payload: WidgetPayload?,
    widthPx: Int,
    heightPx: Int,
  ): Bitmap {
    val maxTotal = payload?.cores.orEmpty().maxOfOrNull { it.totalScore }?.takeIf { it > 0.0 } ?: 1.0
    return createBitmap(
      context = context,
      payload = payload,
      widthPx = widthPx,
      heightPx = heightPx,
      title = "CORE TOTALS",
      valueProvider = { core -> core.totalScore / maxTotal },
      labelProvider = { _, core -> formatScore(core.totalScore) },
    )
  }

  private fun createBitmap(
    context: Context,
    payload: WidgetPayload?,
    widthPx: Int,
    heightPx: Int,
    title: String,
    valueProvider: (WidgetCore) -> Double,
    labelProvider: (Double, WidgetCore) -> String,
  ): Bitmap {
    val safeWidth = max(widthPx, dp(context, 220f))
    val safeHeight = max(heightPx, dp(context, 220f))
    val bitmap = Bitmap.createBitmap(safeWidth, safeHeight, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val density = context.resources.displayMetrics.density
    val panelRect = RectF(0f, 0f, safeWidth.toFloat(), safeHeight.toFloat())

    val panelPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        shader =
          LinearGradient(
            0f,
            0f,
            safeWidth.toFloat(),
            safeHeight.toFloat(),
            Color.parseColor("#15396A"),
            Color.parseColor("#0A2748"),
            Shader.TileMode.CLAMP,
          )
      }
    val titlePaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#EAF4FF")
        textSize = sp(context, 13f).toFloat()
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
      }
    val labelPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#DCEBFF")
        textSize = sp(context, 11f).toFloat()
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
      }
    val valuePaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.RIGHT
        textSize = sp(context, 11f).toFloat()
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
      }
    val trackPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.argb(72, 219, 231, 251)
      }
    val barPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
      }
    val emptyPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#BFD4EA")
        textAlign = Paint.Align.CENTER
        textSize = sp(context, 12f).toFloat()
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
      }

    canvas.drawRoundRect(panelRect, 28f * density, 28f * density, panelPaint)
    canvas.drawText(title, 20f * density, 28f * density, titlePaint)

    val cores = payload?.cores.orEmpty()
    if (cores.isEmpty()) {
      drawCenteredText(canvas, "Open MyStatApp to sync", safeWidth / 2f, safeHeight / 2f, emptyPaint)
      return bitmap
    }

    val top = 52f * density
    val rowHeight = ((safeHeight - top - (18f * density)) / max(cores.size, 1)).coerceAtMost(36f * density)
    val barLeft = 20f * density
    val barRight = safeWidth - (20f * density)
    val barHeight = 9f * density

    cores.forEachIndexed { index, core ->
      val rowTop = top + (index * rowHeight)
      val labelBaseline = rowTop + (11f * density)
      val progress = min(max(valueProvider(core), 0.0), 1.0)
      val valueLabel = labelProvider(progress, core)

      labelPaint.color = Color.parseColor("#DCEBFF")
      canvas.drawText(core.label, barLeft, labelBaseline, labelPaint)
      canvas.drawText(valueLabel, barRight, labelBaseline, valuePaint)

      val barTop = rowTop + (18f * density)
      val trackRect = RectF(barLeft, barTop, barRight, barTop + barHeight)
      canvas.drawRoundRect(trackRect, barHeight / 2f, barHeight / 2f, trackPaint)

      barPaint.color = core.color
      val fillRight = barLeft + ((barRight - barLeft) * progress.toFloat())
      if (fillRight > barLeft) {
        val barRect = RectF(barLeft, barTop, fillRight, barTop + barHeight)
        canvas.drawRoundRect(barRect, barHeight / 2f, barHeight / 2f, barPaint)
      }
    }

    return bitmap
  }

  private fun formatScore(value: Double): String {
    if (value >= 1000.0) {
      return "${(value / 1000.0).toInt()}K"
    }
    return value.toInt().toString()
  }

  private fun drawCenteredText(
    canvas: Canvas,
    value: String,
    x: Float,
    y: Float,
    paint: Paint,
  ) {
    val metrics = paint.fontMetrics
    canvas.drawText(value, x, y - ((metrics.ascent + metrics.descent) / 2f), paint)
  }

  private fun dp(context: Context, value: Float): Int {
    return (value * context.resources.displayMetrics.density).toInt()
  }

  private fun sp(context: Context, value: Float): Int {
    return (value * context.resources.displayMetrics.scaledDensity).toInt()
  }
}
