export function fadeIn(
  node: HTMLElement,
  { animateTransform = false, duration = 200 }
) {
  let didTick = false;
  return {
    duration,
    tick: (t) => {
      if (!didTick) {
        didTick = true;
        node.style.opacity = '0';
        const initialTransform = node.style.transform;
        if (animateTransform) {
          const matrix = window.getComputedStyle(node).transform;
          console.log(matrix);
          const matrixValues = matrix
            .match(/matrix.*\((.+)\)/)[1]
            .split(', ');
          const matrixType = matrix.includes('3d') ? '3d' : '2d';
          let x, y, z;
          if (matrixType === '2d') {
            x = parseFloat(matrixValues[4]);
            y = parseFloat(matrixValues[5]);
            z = 0;
          } else if (matrixType === '3d') {
            x = parseFloat(matrixValues[12]);
            y = parseFloat(matrixValues[13]);
            z = parseFloat(matrixValues[14]);
          }
          y = Number.isFinite(y) ? y : 0;
          z = Number.isFinite(z) ? z : 0;
          node.style.transform = `translate3d(0px, ${y + 50}px, ${
            z + 100
          }px)`;
        }
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            node.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in, filter ${duration}ms ease-in`;
            node.style.opacity = '1';
            if (animateTransform) {
              node.style.transform = initialTransform;
            }
          })
        );
      }
    },
  };
}

export function fadeOut(
  node: HTMLElement,
  { animateTransform = false, duration = 200 }
) {
  let didTick = false;
  return {
    duration,
    tick: (t) => {
      if (!didTick) {
        didTick = true;
        node.style.opacity = '0';
        if (animateTransform) {
          node.style.transform = `translate3d(0, ${200}px, 0) scale(0.5)`;
        }
      }
    },
  };
}
