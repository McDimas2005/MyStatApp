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

object WidgetPieRenderer {
  fun createBitmap(context: Context, payload: WidgetPayload?, sizePx: Int): Bitmap {
    val safeSize = max(sizePx, dp(context, 132f))
    val bitmap = Bitmap.createBitmap(safeSize, safeSize, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val density = context.resources.displayMetrics.density
    val center = safeSize / 2f
    val panelRect = RectF(0f, 0f, safeSize.toFloat(), safeSize.toFloat())
    val radius = safeSize * 0.34f
    val pieRect = RectF(center - radius, center - radius, center + radius, center + radius)

    val panelPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        shader =
          LinearGradient(
            0f,
            0f,
            safeSize.toFloat(),
            safeSize.toFloat(),
            Color.parseColor("#15396A"),
            Color.parseColor("#0A2748"),
            Shader.TileMode.CLAMP,
          )
      }
    val trackPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.argb(78, 219, 231, 251)
      }
    val progressPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        shader =
          LinearGradient(
            pieRect.left,
            pieRect.top,
            pieRect.right,
            pieRect.bottom,
            Color.parseColor("#6AB1FF"),
            Color.parseColor("#37DBC2"),
            Shader.TileMode.CLAMP,
          )
      }
    val holePaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.parseColor("#0D2D53")
      }
    val valuePaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        textSize = sp(context, 24f).toFloat()
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
      }
    val captionPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#BFD4EA")
        textAlign = Paint.Align.CENTER
        textSize = sp(context, 10f).toFloat()
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
      }

    canvas.drawRoundRect(panelRect, 28f * density, 28f * density, panelPaint)
    canvas.drawCircle(center, center, radius, trackPaint)

    val target = payload?.averageScoreTarget?.takeIf { it > 0.0 } ?: 0.0
    val rawProgress = if (target > 0.0) (payload?.averageScore ?: 0.0) / target else 0.0
    val progress = min(max(rawProgress, 0.0), 1.0)
    canvas.drawArc(pieRect, -90f, (progress * 360.0).toFloat(), true, progressPaint)
    canvas.drawCircle(center, center, radius * 0.56f, holePaint)

    val percentLabel = "${(progress * 100.0).toInt()}%"
    drawCenteredText(canvas, percentLabel, center, center - (2f * density), valuePaint)
    drawCenteredText(canvas, "AVERAGE TARGET", center, center + (24f * density), captionPaint)

    return bitmap
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
