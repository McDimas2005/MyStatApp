package com.dimascorp.mystat.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Shader
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

object WidgetRadarRenderer {
  private const val GRID_LEVELS = 4

  fun createBitmap(context: Context, payload: WidgetPayload?, sizePx: Int): Bitmap {
    val safeSize = max(sizePx, dp(context, 132f))
    val bitmap = Bitmap.createBitmap(safeSize, safeSize, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    val density = context.resources.displayMetrics.density
    val center = safeSize / 2f
    val radius = safeSize * 0.26f
    val labelRadius = radius + (20f * density)
    val panelRect = RectF(0f, 0f, safeSize.toFloat(), safeSize.toFloat())

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
    val borderPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        color = Color.argb(82, 230, 241, 255)
        strokeWidth = 1f * density
      }
    val glowPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.argb(64, 94, 168, 255)
        maskFilter = BlurMaskFilter(18f * density, BlurMaskFilter.Blur.NORMAL)
      }

    canvas.drawRoundRect(panelRect, 32f * density, 32f * density, panelPaint)
    canvas.drawRoundRect(panelRect, 32f * density, 32f * density, borderPaint)
    canvas.drawCircle(center, center, radius * 0.88f, glowPaint)

    val cores = payload?.cores.orEmpty()
    if (cores.size < 3) {
      drawEmptyState(context, canvas, center, radius)
      return bitmap
    }

    val target = payload?.averageScoreTarget?.takeIf { it > 0.0 } ?: 1.0
    val ringPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        color = Color.argb(84, 219, 231, 251)
      }
    val axisPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        color = Color.argb(96, 180, 203, 235)
        strokeWidth = 1f * density
      }
    val polygonPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL_AND_STROKE
        strokeWidth = 2f * density
        shader =
          LinearGradient(
            0f,
            center - radius,
            0f,
            center + radius,
            Color.argb(170, 106, 177, 255),
            Color.argb(128, 55, 219, 194),
            Shader.TileMode.CLAMP,
          )
      }
    val polygonOutlinePaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        color = Color.parseColor("#CFE2FF")
        strokeWidth = 2f * density
      }
    val labelPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#EAF4FF")
        textAlign = Paint.Align.CENTER
        textSize = sp(context, 10f).toFloat()
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
      }
    val pointPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
      }
    val centerPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
      }

    repeat(GRID_LEVELS) { index ->
      val levelRadius = radius * ((index + 1).toFloat() / GRID_LEVELS.toFloat())
      canvas.drawPath(
        buildPolygonPath(cores.size, center, center, levelRadius) { 1f },
        ringPaint.apply {
          strokeWidth = if (index == GRID_LEVELS - 1) 1.5f * density else 1f * density
        },
      )
    }

    cores.forEachIndexed { index, _ ->
      val angle = angleFor(index, cores.size)
      val axisX = center + (cos(angle).toFloat() * radius)
      val axisY = center + (sin(angle).toFloat() * radius)
      canvas.drawLine(center, center, axisX, axisY, axisPaint)
    }

    val polygonPath =
      buildPolygonPath(cores.size, center, center, radius) { index ->
        min((cores[index].totalScore / target).toFloat(), 1f)
      }
    canvas.drawPath(polygonPath, polygonPaint)
    canvas.drawPath(polygonPath, polygonOutlinePaint)
    canvas.drawCircle(center, center, 3.2f * density, centerPaint)

    cores.forEachIndexed { index, core ->
      val angle = angleFor(index, cores.size)
      val scale = min((core.totalScore / target).toFloat(), 1f)
      val pointX = center + (cos(angle).toFloat() * radius * scale)
      val pointY = center + (sin(angle).toFloat() * radius * scale)
      val labelX = center + (cos(angle).toFloat() * labelRadius)
      val labelY = center + (sin(angle).toFloat() * labelRadius) + (3f * density)

      pointPaint.color = core.color
      canvas.drawCircle(pointX, pointY, 4.2f * density, pointPaint)
      canvas.drawText(core.label, labelX, labelY, labelPaint)
    }

    return bitmap
  }

  private fun drawEmptyState(context: Context, canvas: Canvas, center: Float, radius: Float) {
    val density = context.resources.displayMetrics.density
    val emptyPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        color = Color.argb(120, 219, 231, 251)
        strokeWidth = 1.5f * density
      }
    val textPaint =
      Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#EAF4FF")
        textAlign = Paint.Align.CENTER
        textSize = sp(context, 11f).toFloat()
        typeface = android.graphics.Typeface.create(android.graphics.Typeface.DEFAULT, android.graphics.Typeface.BOLD)
      }
    canvas.drawCircle(center, center, radius * 0.92f, emptyPaint)
    canvas.drawText("Open MyStatApp", center, center - (4f * density), textPaint)
    textPaint.textSize = sp(context, 9f).toFloat()
    canvas.drawText("to sync widget data", center, center + (14f * density), textPaint)
  }

  private fun buildPolygonPath(
    pointCount: Int,
    centerX: Float,
    centerY: Float,
    radius: Float,
    scaleProvider: (Int) -> Float,
  ): Path {
    val path = Path()
    for (index in 0 until pointCount) {
      val angle = angleFor(index, pointCount)
      val scaledRadius = radius * scaleProvider(index)
      val x = centerX + (cos(angle).toFloat() * scaledRadius)
      val y = centerY + (sin(angle).toFloat() * scaledRadius)
      if (index == 0) {
        path.moveTo(x, y)
      } else {
        path.lineTo(x, y)
      }
    }
    path.close()
    return path
  }

  private fun angleFor(index: Int, count: Int): Double {
    return (-PI / 2.0) + (index * PI * 2.0 / count.toDouble())
  }

  private fun dp(context: Context, value: Float): Int {
    return (value * context.resources.displayMetrics.density).toInt()
  }

  private fun sp(context: Context, value: Float): Int {
    return (value * context.resources.displayMetrics.scaledDensity).toInt()
  }
}
