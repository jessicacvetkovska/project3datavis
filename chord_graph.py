import numpy as np
import matplotlib.pyplot as plt
from matplotlib.path import Path
from matplotlib.patches import PathPatch


ARC_R        = 1.0
ARC_W        = 0.09
GAP          = 0.045
CHORD_ALPHA  = 0.38
LABEL_OFFSET = 0.20


def _arc_pts(r, a0, a1, n=80):
    t = np.linspace(a0, a1, n)
    return r * np.cos(t), r * np.sin(t)


def _quad_bezier(p0, ctrl, p1, n=50):
    t    = np.linspace(0, 1, n)[:, None]
    pts  = (1-t)**2 * np.array(p0) + 2*(1-t)*t * np.array(ctrl) + t**2 * np.array(p1)
    return pts[:, 0], pts[:, 1]


def _chord_patch(r, a0, a1, b0, b1, color, alpha):
    O   = np.array([0.0, 0.0])
    xa,  ya  = _arc_pts(r, a0, a1)
    bx1, by1 = _quad_bezier([r*np.cos(a1), r*np.sin(a1)], O, [r*np.cos(b0), r*np.sin(b0)])
    xb,  yb  = _arc_pts(r, b0, b1)
    bx2, by2 = _quad_bezier([r*np.cos(b1), r*np.sin(b1)], O, [r*np.cos(a0), r*np.sin(a0)])

    xs    = np.r_[xa, bx1[1:], xb, bx2[1:]]
    ys    = np.r_[ya, by1[1:], yb, by2[1:]]
    codes = np.full(len(xs), Path.LINETO, dtype=np.uint8)
    codes[0]  = Path.MOVETO
    codes[-1] = Path.CLOSEPOLY

    return PathPatch(Path(np.column_stack([xs, ys]), codes),
                     facecolor=color, edgecolor="none", alpha=alpha, zorder=1)


def draw_chord(ax, labels, matrix, colors, title=None, bg="#0D0D0D"):
    """
    Draw a chord diagram onto `ax`.

    Parameters
    ----------
    ax      : matplotlib Axes
    labels  : list[str]          — node names
    matrix  : 2-D array-like     — symmetric co-occurrence counts (diagonal ignored)
    colors  : list[str]          — one hex/named color per node
    title   : str | None         — optional subtitle drawn at the bottom
    bg      : str                — background color
    """
    ax.clear()
    ax.set_facecolor(bg)
    ax.set_aspect("equal")
    ax.axis("off")

    mat = np.array(matrix, dtype=float)
    np.fill_diagonal(mat, 0)
    n      = len(labels)
    totals = mat.sum(axis=1)
    grand  = totals.sum()

    R, R_IN = ARC_R, ARC_R - ARC_W
    avail   = 2 * np.pi - GAP * n
    scale   = avail / grand

    # Node arc extents
    arc_s = np.zeros(n)
    arc_e = np.zeros(n)
    ang   = np.pi / 2
    for i in range(n):
        arc_s[i] = ang
        arc_e[i] = ang + totals[i] * scale
        ang       = arc_e[i] + GAP

    # Sub-arc positions for each chord
    cs = np.zeros((n, n))
    ce = np.zeros((n, n))
    for i in range(n):
        span = arc_e[i] - arc_s[i]
        pos  = arc_s[i]
        for j in range(n):
            if mat[i, j] > 0:
                frac     = mat[i, j] / totals[i] if totals[i] else 0
                cs[i, j] = pos
                ce[i, j] = pos + frac * span
                pos       = ce[i, j]

    # Chords
    for i in range(n):
        for j in range(i + 1, n):
            if mat[i, j] == 0:
                continue
            ax.add_patch(_chord_patch(R_IN, cs[i,j], ce[i,j],
                                      cs[j,i], ce[j,i], colors[i], CHORD_ALPHA))

    # Outer arc bands
    for i in range(n):
        t  = np.linspace(arc_s[i], arc_e[i], 300)
        xo = R    * np.cos(t);  yo = R    * np.sin(t)
        xi = R_IN * np.cos(t[::-1]); yi = R_IN * np.sin(t[::-1])
        ax.fill(np.r_[xo, xi], np.r_[yo, yi], color=colors[i], alpha=0.95, zorder=3)

    # Labels
    LR = R + LABEL_OFFSET
    for i in range(n):
        mid = (arc_s[i] + arc_e[i]) / 2
        lx, ly = LR * np.cos(mid), LR * np.sin(mid)
        deg    = np.degrees(mid)
        if 90 < (deg % 360) < 270:
            deg += 180
        ax.text(lx, ly, labels[i], ha="center", va="center",
                color=colors[i], fontsize=7.5, fontfamily="monospace",
                fontweight="bold", rotation=deg, rotation_mode="anchor", zorder=5)

    lim = R + LABEL_OFFSET + 0.30
    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)

    if title:
        ax.text(0, -(lim - 0.04), title, ha="center", va="bottom",
                color="#555555", fontsize=7, fontfamily="monospace", zorder=5)