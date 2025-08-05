// Run this in the browser console to debug edge rendering

function debugEdges() {
  console.log('=== EDGE RENDERING DEBUG ===');
  
  // Check if React Flow container exists
  const reactFlowContainer = document.querySelector('.react-flow');
  console.log('React Flow container found:', !!reactFlowContainer);
  
  // Check for edges container
  const edgesContainer = document.querySelector('.react-flow__edges');
  console.log('Edges container found:', !!edgesContainer);
  
  if (edgesContainer) {
    const computedStyle = window.getComputedStyle(edgesContainer);
    console.log('Edges container styles:', {
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
      zIndex: computedStyle.zIndex,
      pointerEvents: computedStyle.pointerEvents
    });
  }
  
  // Check for SVG element
  const svg = document.querySelector('.react-flow__edges svg');
  console.log('SVG element found:', !!svg);
  
  if (svg) {
    const svgStyle = window.getComputedStyle(svg);
    console.log('SVG styles:', {
      display: svgStyle.display,
      visibility: svgStyle.visibility,
      opacity: svgStyle.opacity,
      width: svgStyle.width,
      height: svgStyle.height,
      overflow: svgStyle.overflow
    });
    
    // Check SVG dimensions
    const bbox = svg.getBoundingClientRect();
    console.log('SVG bounding box:', bbox);
  }
  
  // Check for edge elements
  const edges = document.querySelectorAll('.react-flow__edge');
  console.log('Number of edge elements:', edges.length);
  
  // Check for edge paths
  const paths = document.querySelectorAll('.react-flow__edge path');
  console.log('Number of edge paths:', paths.length);
  
  paths.forEach((path, index) => {
    const d = path.getAttribute('d');
    const stroke = window.getComputedStyle(path).stroke;
    const strokeWidth = window.getComputedStyle(path).strokeWidth;
    const opacity = window.getComputedStyle(path).opacity;
    const fill = window.getComputedStyle(path).fill;
    
    console.log(`Edge ${index}:`, {
      d: d ? d.substring(0, 50) + '...' : 'NO PATH DATA',
      stroke,
      strokeWidth,
      opacity,
      fill,
      visible: opacity !== '0' && stroke !== 'none'
    });
  });
  
  // Check React Flow instance
  if (window.__REACT_FLOW_INSTANCE__) {
    const instance = window.__REACT_FLOW_INSTANCE__;
    console.log('React Flow edges from instance:', instance.getEdges());
  }
  
  // Check for any error messages
  const errors = document.querySelectorAll('.react-flow__error');
  if (errors.length > 0) {
    console.error('React Flow errors found:', errors);
  }
  
  console.log('=== END DEBUG ===');
}

// Call the debug function
debugEdges();

// Also log when edges change
const observer = new MutationObserver((mutations) => {
  const edgesMutated = mutations.some(m => 
    m.target.classList?.contains('react-flow__edges') ||
    m.target.closest?.('.react-flow__edges')
  );
  
  if (edgesMutated) {
    console.log('Edges container mutated!');
    debugEdges();
  }
});

const edgesContainer = document.querySelector('.react-flow__edges');
if (edgesContainer) {
  observer.observe(edgesContainer, {
    childList: true,
    subtree: true,
    attributes: true
  });
  console.log('Observing edges container for changes...');
}