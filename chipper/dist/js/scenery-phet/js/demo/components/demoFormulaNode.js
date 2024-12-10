// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for FormulaNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import FormulaNode from '../../FormulaNode.js';
export default function demoFormulaNode(layoutBounds) {
    const conditional = '\\forall \\mathbf{p}\\in\\mathbb{R}^2';
    const leftVert = '\\left\\lVert';
    const rightVert = '\\right\\rVert';
    const matrix = '\\begin{bmatrix} \\cos\\theta & \\sin\\theta \\\\ -\\sin\\theta & \\cos\\theta \\end{bmatrix}^{k+1}';
    const sumExpr = `${leftVert}\\sum_{k=1}^{\\infty}kx^{k-1}${matrix}${rightVert}`;
    const integral = '\\int_{0}^{2\\pi}\\overline{f(\\theta)}\\cos\\theta\\,\\mathrm{d}\\theta';
    const invCos = '\\cos^{-1}\\left( \\frac{\\sqrt{\\varphi_2}}{\\sqrt{x_2^2+x_3^2}} \\right)';
    const formulaNode = new FormulaNode(`${conditional}\\quad ${sumExpr} = ${invCos} + ${integral}`, {
        center: layoutBounds.center,
        scale: 1.3,
        displayMode: true
    });
    const boundsRectangle = Rectangle.bounds(formulaNode.bounds, {
        fill: 'rgba(0,0,0,0.1)'
    });
    return new Node({
        children: [
            boundsRectangle,
            formulaNode
        ]
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0Zvcm11bGFOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIEZvcm11bGFOb2RlXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEZvcm11bGFOb2RlIGZyb20gJy4uLy4uL0Zvcm11bGFOb2RlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0Zvcm11bGFOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgY29uZGl0aW9uYWwgPSAnXFxcXGZvcmFsbCBcXFxcbWF0aGJme3B9XFxcXGluXFxcXG1hdGhiYntSfV4yJztcbiAgY29uc3QgbGVmdFZlcnQgPSAnXFxcXGxlZnRcXFxcbFZlcnQnO1xuICBjb25zdCByaWdodFZlcnQgPSAnXFxcXHJpZ2h0XFxcXHJWZXJ0JztcbiAgY29uc3QgbWF0cml4ID0gJ1xcXFxiZWdpbntibWF0cml4fSBcXFxcY29zXFxcXHRoZXRhICYgXFxcXHNpblxcXFx0aGV0YSBcXFxcXFxcXCAtXFxcXHNpblxcXFx0aGV0YSAmIFxcXFxjb3NcXFxcdGhldGEgXFxcXGVuZHtibWF0cml4fV57aysxfSc7XG4gIGNvbnN0IHN1bUV4cHIgPSBgJHtsZWZ0VmVydH1cXFxcc3VtX3trPTF9XntcXFxcaW5mdHl9a3hee2stMX0ke21hdHJpeH0ke3JpZ2h0VmVydH1gO1xuICBjb25zdCBpbnRlZ3JhbCA9ICdcXFxcaW50X3swfV57MlxcXFxwaX1cXFxcb3ZlcmxpbmV7ZihcXFxcdGhldGEpfVxcXFxjb3NcXFxcdGhldGFcXFxcLFxcXFxtYXRocm17ZH1cXFxcdGhldGEnO1xuICBjb25zdCBpbnZDb3MgPSAnXFxcXGNvc157LTF9XFxcXGxlZnQoIFxcXFxmcmFje1xcXFxzcXJ0e1xcXFx2YXJwaGlfMn19e1xcXFxzcXJ0e3hfMl4yK3hfM14yfX0gXFxcXHJpZ2h0KSc7XG5cbiAgY29uc3QgZm9ybXVsYU5vZGUgPSBuZXcgRm9ybXVsYU5vZGUoIGAke2NvbmRpdGlvbmFsfVxcXFxxdWFkICR7c3VtRXhwcn0gPSAke2ludkNvc30gKyAke2ludGVncmFsfWAsIHtcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXIsXG4gICAgc2NhbGU6IDEuMyxcbiAgICBkaXNwbGF5TW9kZTogdHJ1ZVxuICB9ICk7XG5cbiAgY29uc3QgYm91bmRzUmVjdGFuZ2xlID0gUmVjdGFuZ2xlLmJvdW5kcyggZm9ybXVsYU5vZGUuYm91bmRzLCB7XG4gICAgZmlsbDogJ3JnYmEoMCwwLDAsMC4xKSdcbiAgfSApO1xuXG4gIHJldHVybiBuZXcgTm9kZSgge1xuICAgIGNoaWxkcmVuOiBbIGJvdW5kc1JlY3RhbmdsZSwgZm9ybXVsYU5vZGUgXVxuICB9ICk7XG59Il0sIm5hbWVzIjpbIk5vZGUiLCJSZWN0YW5nbGUiLCJGb3JtdWxhTm9kZSIsImRlbW9Gb3JtdWxhTm9kZSIsImxheW91dEJvdW5kcyIsImNvbmRpdGlvbmFsIiwibGVmdFZlcnQiLCJyaWdodFZlcnQiLCJtYXRyaXgiLCJzdW1FeHByIiwiaW50ZWdyYWwiLCJpbnZDb3MiLCJmb3JtdWxhTm9kZSIsImNlbnRlciIsInNjYWxlIiwiZGlzcGxheU1vZGUiLCJib3VuZHNSZWN0YW5nbGUiLCJib3VuZHMiLCJmaWxsIiwiY2hpbGRyZW4iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsU0FBU0EsSUFBSSxFQUFFQyxTQUFTLFFBQVEsb0NBQW9DO0FBQ3BFLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFFL0MsZUFBZSxTQUFTQyxnQkFBaUJDLFlBQXFCO0lBRTVELE1BQU1DLGNBQWM7SUFDcEIsTUFBTUMsV0FBVztJQUNqQixNQUFNQyxZQUFZO0lBQ2xCLE1BQU1DLFNBQVM7SUFDZixNQUFNQyxVQUFVLEdBQUdILFNBQVMsNkJBQTZCLEVBQUVFLFNBQVNELFdBQVc7SUFDL0UsTUFBTUcsV0FBVztJQUNqQixNQUFNQyxTQUFTO0lBRWYsTUFBTUMsY0FBYyxJQUFJVixZQUFhLEdBQUdHLFlBQVksT0FBTyxFQUFFSSxRQUFRLEdBQUcsRUFBRUUsT0FBTyxHQUFHLEVBQUVELFVBQVUsRUFBRTtRQUNoR0csUUFBUVQsYUFBYVMsTUFBTTtRQUMzQkMsT0FBTztRQUNQQyxhQUFhO0lBQ2Y7SUFFQSxNQUFNQyxrQkFBa0JmLFVBQVVnQixNQUFNLENBQUVMLFlBQVlLLE1BQU0sRUFBRTtRQUM1REMsTUFBTTtJQUNSO0lBRUEsT0FBTyxJQUFJbEIsS0FBTTtRQUNmbUIsVUFBVTtZQUFFSDtZQUFpQko7U0FBYTtJQUM1QztBQUNGIn0=