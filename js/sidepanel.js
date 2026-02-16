/**
 * "Drift" - Generative sidepanel art
 * Floating geometric shapes that drift, rotate, and form fleeting connections.
 * A meditation on how ideas find each other.
 */
(function () {
    const COLORS = [
        { r: 45, g: 106, b: 79 },   // emerald
        { r: 199, g: 123, b: 63 },   // amber
        { r: 58, g: 124, b: 165 },   // ocean
        { r: 194, g: 85, b: 110 },   // rose
    ];

    const SHAPE_COUNT = 18;
    const CONNECTION_DIST = 120;
    const PARTICLE_LIFE = 80;

    class Shape {
        constructor(w, h) {
            this.reset(w, h, true);
        }

        reset(w, h, initial) {
            this.x = Math.random() * w;
            this.y = initial ? Math.random() * h : h + 20;
            this.size = 3 + Math.random() * 6;
            this.type = Math.floor(Math.random() * 4); // 0=circle, 1=triangle, 2=diamond, 3=square
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.alpha = 0.15 + Math.random() * 0.25;
            this.baseAlpha = this.alpha;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.008;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = -0.15 - Math.random() * 0.35;
            this.wobblePhase = Math.random() * Math.PI * 2;
            this.wobbleSpeed = 0.005 + Math.random() * 0.01;
            this.wobbleAmp = 0.2 + Math.random() * 0.4;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.01 + Math.random() * 0.02;
        }

        update(w, h) {
            this.wobblePhase += this.wobbleSpeed;
            this.pulsePhase += this.pulseSpeed;
            this.x += this.vx + Math.sin(this.wobblePhase) * this.wobbleAmp;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.08;

            if (this.y < -30 || this.x < -30 || this.x > w + 30) {
                this.reset(w, h, false);
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
            ctx.strokeStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.alpha * 0.5})`;
            ctx.lineWidth = 0.5;

            const s = this.size;
            switch (this.type) {
                case 0: // circle
                    ctx.beginPath();
                    ctx.arc(0, 0, s, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 1: // triangle
                    ctx.beginPath();
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.866, s * 0.5);
                    ctx.lineTo(-s * 0.866, s * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 2: // diamond
                    ctx.beginPath();
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s * 0.7, 0);
                    ctx.lineTo(0, s);
                    ctx.lineTo(-s * 0.7, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 3: // square
                    ctx.fillRect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4);
                    break;
            }
            ctx.restore();
        }
    }

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.life = PARTICLE_LIFE;
            this.maxLife = PARTICLE_LIFE;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = 1 + Math.random() * 1.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.life--;
        }

        draw(ctx) {
            const t = this.life / this.maxLife;
            ctx.globalAlpha = t * 0.4;
            ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * t, 0, Math.PI * 2);
            ctx.fill();
        }

        isDead() {
            return this.life <= 0;
        }
    }

    class DriftCanvas {
        constructor(side) {
            this.canvas = document.createElement('canvas');
            this.canvas.className = `sidepanel-canvas ${side}`;
            this.ctx = this.canvas.getContext('2d');
            this.side = side;
            this.shapes = [];
            this.particles = [];
            this.bloomTimer = 200 + Math.random() * 300;

            document.body.prepend(this.canvas);
            this.resize();
            this.initShapes();
        }

        resize() {
            const containerWidth = Math.min(800, window.innerWidth);
            const sideWidth = Math.max(0, (window.innerWidth - containerWidth) / 2);
            this.canvas.width = sideWidth;
            this.canvas.height = window.innerHeight;
            this.w = sideWidth;
            this.h = window.innerHeight;
        }

        initShapes() {
            this.shapes = [];
            for (let i = 0; i < SHAPE_COUNT; i++) {
                this.shapes.push(new Shape(this.w, this.h));
            }
        }

        update() {
            if (this.w < 20) return;

            for (const shape of this.shapes) {
                shape.update(this.w, this.h);
            }

            // Bloom events
            this.bloomTimer--;
            if (this.bloomTimer <= 0) {
                const source = this.shapes[Math.floor(Math.random() * this.shapes.length)];
                if (source.y > 0 && source.y < this.h && source.x > 0 && source.x < this.w) {
                    for (let i = 0; i < 6; i++) {
                        this.particles.push(new Particle(source.x, source.y, source.color));
                    }
                }
                this.bloomTimer = 200 + Math.random() * 400;
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                if (this.particles[i].isDead()) {
                    this.particles.splice(i, 1);
                }
            }
        }

        draw() {
            if (this.w < 20) return;

            this.ctx.clearRect(0, 0, this.w, this.h);

            // Draw connections
            for (let i = 0; i < this.shapes.length; i++) {
                for (let j = i + 1; j < this.shapes.length; j++) {
                    const a = this.shapes[i];
                    const b = this.shapes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const t = 1 - dist / CONNECTION_DIST;
                        this.ctx.globalAlpha = t * 0.12;
                        this.ctx.strokeStyle = `rgb(${a.color.r},${a.color.g},${a.color.b})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.beginPath();
                        this.ctx.moveTo(a.x, a.y);
                        this.ctx.lineTo(b.x, b.y);
                        this.ctx.stroke();
                    }
                }
            }

            // Draw shapes
            for (const shape of this.shapes) {
                shape.draw(this.ctx);
            }

            // Draw particles
            for (const p of this.particles) {
                p.draw(this.ctx);
            }

            this.ctx.globalAlpha = 1;
        }
    }

    // Only initialize on screens wide enough to show sidepanels
    if (window.innerWidth <= 900) return;

    const leftPanel = new DriftCanvas('left');
    const rightPanel = new DriftCanvas('right');

    function animate() {
        leftPanel.update();
        rightPanel.update();
        leftPanel.draw();
        rightPanel.draw();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        leftPanel.resize();
        rightPanel.resize();
    });

    animate();
})();
