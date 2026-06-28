// ==========================================
// FUNCTIONS DE RENDU AMÉLIORÉES (3DFake)
// ==========================================

drawPlayer(obj) {
    const center = this.project(obj.x, obj.y, obj.z);
    const size = obj.size * center.scale;
    if (size < 2 || center.depth < 0) return;

    // Dessiner un cube 3D simplifié (avec perspective)
    const half = size / 2;
    const corners = [
        [-half, -half, -half], [ half, -half, -half],
        [ half,  half, -half], [-half,  half, -half],
        [-half, -half,  half], [ half, -half,  half],
        [ half,  half,  half], [-half,  half,  half]
    ];

    // Appliquer une rotation simple autour de Y
    const rot = obj.rotY || 0;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const projected = corners.map(c => {
        const x = c[0] * cos - c[2] * sin;
        const z = c[0] * sin + c[2] * cos;
        const y = c[1];
        return this.project(obj.x + x, obj.y + y, obj.z + z);
    });

    // Dessiner les arêtes du cube
    const edges = [
        [0,1], [1,2], [2,3], [3,0],
        [4,5], [5,6], [6,7], [7,4],
        [0,4], [1,5], [2,6], [3,7]
    ];

    ctx.strokeStyle = obj.color || '#00ccff';
    ctx.lineWidth = 2;
    ctx.shadowColor = obj.color || '#00ccff';
    ctx.shadowBlur = 15;

    for (const edge of edges) {
        const p1 = projected[edge[0]];
        const p2 = projected[edge[1]];
        if (p1.depth > 0 || p2.depth > 0) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
    ctx.shadowBlur = 0;
},

drawCoin(obj) {
    const center = this.project(obj.x, obj.y, obj.z);
    const radius = obj.size * center.scale * 0.7;
    if (radius < 1 || center.depth < 0) return;

    // Dessiner un disque avec effet 3D (ombre et dégradé)
    const grad = ctx.createRadialGradient(
        center.x - radius * 0.3, center.y - radius * 0.3, radius * 0.1,
        center.x, center.y, radius
    );
    grad.addColorStop(0, '#fffbe6');
    grad.addColorStop(0.4, '#ffd93d');
    grad.addColorStop(1, '#b8860b');

    ctx.shadowColor = '#ffd93d';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius, radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ajouter une ligne pour simuler l'épaisseur
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius, radius * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();
},

drawObstacle(obj) {
    const center = this.project(obj.x, obj.y, obj.z);
    const size = obj.size * center.scale;
    if (size < 2 || center.depth < 0) return;

    const half = size / 2;

    if (obj.type === 'sphere') {
        // Dessiner une sphère avec un dégradé radial
        const grad = ctx.createRadialGradient(
            center.x - half * 0.3, center.y - half * 0.3, half * 0.1,
            center.x, center.y, half
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, obj.color);
        grad.addColorStop(1, '#222222');

        ctx.shadowColor = obj.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(center.x, center.y, half, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        // Dessiner une pyramide (tétraèdre) simplifiée
        const points = [
            [0, -half, -half], [-half, half, half],
            [half, half, half], [0, -half, half],
            [0, -half, -half], [-half, half, -half],
            [half, half, -half], [0, -half, -half],
            [-half, half, -half], [-half, half, half],
            [half, half, half], [half, half, -half]
        ];

        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = obj.color;
        ctx.shadowBlur = 15;

        // Projeter les points
        const projected = points.map(p => {
            const rot = obj.rotY || 0;
            const cos = Math.cos(rot);
            const sin = Math.sin(rot);
            const x = p[0] * cos - p[2] * sin;
            const z = p[0] * sin + p[2] * cos;
            return this.project(obj.x + x, obj.y + p[1], obj.z + z);
        });

        // Dessiner les arêtes de la pyramide
        for (let i = 0; i < projected.length - 1; i++) {
            const p1 = projected[i];
            const p2 = projected[i+1];
            if (p1.depth > 0 || p2.depth > 0) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
        // Fermer la base
        const p1 = projected[projected.length - 1];
        const p2 = projected[0];
        if (p1.depth > 0 || p2.depth > 0) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
}
