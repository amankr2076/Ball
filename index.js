
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const ballRadius = 150; // Ball radius
        const dotsCount = 20; // Number of icons
        const icons = [];
        const baseIconSize = 40; // Base size of the icons

        // List of icon images
        const iconPaths = [
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
        ];

        // Load icon images
        iconPaths.forEach((path) => {
            const img = new Image();
            img.src = path;
            icons.push(img);
        });

        const dots = [];

        // Fibonacci Sphere Algorithm for evenly distributing points
        function fibonacciSphere(samples, radius) {
            const points = [];
            const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

            for (let i = 0; i < samples; i++) {
                const y = 1 - (i / (samples - 1)) * 2; // y goes from 1 to -1
                const radiusAtY = Math.sqrt(1 - y * y); // Radius of circle at height y
                const theta = phi * i; // Angle for the current point
                const x = Math.cos(theta) * radiusAtY;
                const z = Math.sin(theta) * radiusAtY;
                points.push({
                    x: x * radius,
                    y: y * radius,
                    z: z * radius,
                    icon: icons[i % icons.length], // Assign an icon
                });
            }

            return points;
        }

        // Initialize points on the sphere
        const spherePoints = fibonacciSphere(dotsCount, ballRadius);
        dots.push(...spherePoints);

        let angleX = 0.01; // Rotation speed around X-axis
        let angleY = 0.01; // Rotation speed around Y-axis

        let touchStartX = 0;
        let touchStartY = 0;

        // Mouse interaction
        canvas.addEventListener('mousemove', (event) => {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            // Calculate relative position of the mouse to the ball's center
            const deltaX = mouseX - centerX;
            const deltaY = mouseY - centerY;

            // Adjust rotation speed based on cursor position
            const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);

            // Normalize speed (closer to ball -> slower rotation)
            const speedFactor = 1 - distance / maxDistance;

            angleX = speedFactor * (deltaY / centerY) * 0.05; // Top-to-bottom rotation
            angleY = speedFactor * (deltaX / centerX) * 0.05; // Left-to-right rotation
        });

        // Touch interaction for mobile
        canvas.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        });

        canvas.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;

            // Calculate the swipe direction
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Adjust rotation speed based on swipe direction
            angleX = (deltaY / centerY) * 0.05; // Top-to-bottom or bottom-to-top
            angleY = (deltaX / centerX) * 0.05; // Left-to-right or right-to-left

            touchStartX = touchEndX;
            touchStartY = touchEndY;
        });

        function rotateX(dot, angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const y = dot.y * cos - dot.z * sin;
            const z = dot.y * sin + dot.z * cos;
            return { x: dot.x, y, z, icon: dot.icon };
        }

        function rotateY(dot, angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x = dot.x * cos - dot.z * sin;
            const z = dot.x * sin + dot.z * cos;
            return { x, y: dot.y, z, icon: dot.icon };
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < dots.length; i++) {
                let rotatedDot = rotateX(dots[i], angleX);
                rotatedDot = rotateY(rotatedDot, angleY);

                dots[i] = rotatedDot;

                const perspective = 300 / (300 + rotatedDot.z);
                const x2D = rotatedDot.x * perspective + centerX;
                const y2D = rotatedDot.y * perspective + centerY;

                const opacity = Math.max(0, Math.min(1, (rotatedDot.z + ballRadius) / (2 * ballRadius)));
                const iconSize = baseIconSize * perspective;

                if (rotatedDot.icon.complete) {
                    ctx.globalAlpha = 1 - opacity; // Fade as it moves to the back
                    ctx.drawImage(
                        rotatedDot.icon,
                        x2D - iconSize / 2,
                        y2D - iconSize / 2,
                        iconSize,
                        iconSize
                    );
                }
            }

            ctx.globalAlpha = 1; // Reset opacity for next frame
            requestAnimationFrame(draw);
        }

        draw();
