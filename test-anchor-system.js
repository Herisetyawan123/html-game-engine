/**
 * Test file for the anchor + offset positioning system (Step 1)
 * This file can be included in index.html to verify the implementation
 * 
 * Expected Canvas: 1280 x 720
 */

// Mock BASE_WIDTH and BASE_HEIGHT for testing
const BASE_WIDTH = 1280;
const BASE_HEIGHT = 720;

console.log('=== Anchor + Offset Positioning System Tests ===\n');

// Test 1: Default behavior (left, top)
console.log('Test 1: Default position (left, top)');
const el1 = new UIElement(100, 50, 200, 100);
const bounds1 = el1.getWorldPosition();
console.log('Input: x=100, y=50, w=200, h=100');
console.log('Expected: x=100, y=50');
console.log('Actual: x=' + bounds1.x + ', y=' + bounds1.y);
console.log('Pass: ' + (bounds1.x === 100 && bounds1.y === 50 ? '✓' : '✗') + '\n');

// Test 2: Center anchor
console.log('Test 2: Center anchor with zero offset');
const el2 = new UIElement({ x: 0, y: 0, width: 200, height: 100, anchorX: 'center', anchorY: 'middle' });
const bounds2 = el2.getWorldPosition();
const expectedX2 = (1280 - 200) / 2; // 540
const expectedY2 = (720 - 100) / 2;  // 310
console.log('Input: x=0, y=0, w=200, h=100, anchorX="center", anchorY="middle"');
console.log('Expected: x=' + expectedX2 + ', y=' + expectedY2);
console.log('Actual: x=' + bounds2.x + ', y=' + bounds2.y);
console.log('Pass: ' + (bounds2.x === expectedX2 && bounds2.y === expectedY2 ? '✓' : '✗') + '\n');

// Test 3: Center + offset
console.log('Test 3: Center anchor with positive offset');
const el3 = new UIElement({ x: 100, y: 0, width: 200, height: 100, anchorX: 'center', anchorY: 'middle' });
const bounds3 = el3.getWorldPosition();
const expectedX3 = (1280 - 200) / 2 + 100; // 540 + 100 = 640
const expectedY3 = (720 - 100) / 2;        // 310
console.log('Input: x=100, y=0, w=200, h=100, anchorX="center", anchorY="middle"');
console.log('Expected: x=' + expectedX3 + ', y=' + expectedY3);
console.log('Actual: x=' + bounds3.x + ', y=' + bounds3.y);
console.log('Pass: ' + (bounds3.x === expectedX3 && bounds3.y === expectedY3 ? '✓' : '✗') + '\n');

// Test 4: Center + negative offset
console.log('Test 4: Center anchor with negative offset');
const el4 = new UIElement({ x: -100, y: 0, width: 200, height: 100, anchorX: 'center', anchorY: 'middle' });
const bounds4 = el4.getWorldPosition();
const expectedX4 = (1280 - 200) / 2 - 100; // 540 - 100 = 440
const expectedY4 = (720 - 100) / 2;        // 310
console.log('Input: x=-100, y=0, w=200, h=100, anchorX="center", anchorY="middle"');
console.log('Expected: x=' + expectedX4 + ', y=' + expectedY4);
console.log('Actual: x=' + bounds4.x + ', y=' + bounds4.y);
console.log('Pass: ' + (bounds4.x === expectedX4 && bounds4.y === expectedY4 ? '✓' : '✗') + '\n');

// Test 5: Right + bottom anchors
console.log('Test 5: Right and bottom anchors with negative offset');
const el5 = new UIElement({ x: -20, y: -20, width: 200, height: 100, anchorX: 'right', anchorY: 'bottom' });
const bounds5 = el5.getWorldPosition();
const expectedX5 = (1280 - 200) - 20;  // 1080 - 20 = 1060
const expectedY5 = (720 - 100) - 20;   // 620 - 20 = 600
console.log('Input: x=-20, y=-20, w=200, h=100, anchorX="right", anchorY="bottom"');
console.log('Expected: x=' + expectedX5 + ', y=' + expectedY5);
console.log('Actual: x=' + bounds5.x + ', y=' + bounds5.y);
console.log('Pass: ' + (bounds5.x === expectedX5 && bounds5.y === expectedY5 ? '✓' : '✗') + '\n');

// Test 6: Legacy syntax - string x value
console.log('Test 6: Legacy syntax with x="center"');
const el6 = new UIElement({ x: 'center', y: 100, width: 200, height: 100 });
const bounds6 = el6.getWorldPosition();
const expectedX6 = (1280 - 200) / 2; // 540
const expectedY6 = 100;
console.log('Input: x="center", y=100, w=200, h=100');
console.log('Expected: x=' + expectedX6 + ', y=' + expectedY6 + ' (anchorX should be "center")');
console.log('Actual: x=' + bounds6.x + ', y=' + bounds6.y + ', anchorX=' + el6.anchorX);
console.log('Pass: ' + (bounds6.x === expectedX6 && bounds6.y === expectedY6 && el6.anchorX === 'center' ? '✓' : '✗') + '\n');

// Test 7: Legacy syntax - string y value
console.log('Test 7: Legacy syntax with y="middle"');
const el7 = new UIElement({ x: 100, y: 'middle', width: 200, height: 100 });
const bounds7 = el7.getWorldPosition();
const expectedX7 = 100;
const expectedY7 = (720 - 100) / 2; // 310
console.log('Input: x=100, y="middle", w=200, h=100');
console.log('Expected: x=' + expectedX7 + ', y=' + expectedY7 + ' (anchorY should be "middle")');
console.log('Actual: x=' + bounds7.x + ', y=' + bounds7.y + ', anchorY=' + el7.anchorY);
console.log('Pass: ' + (bounds7.x === expectedX7 && bounds7.y === expectedY7 && el7.anchorY === 'middle' ? '✓' : '✗') + '\n');

// Test 8: Hit testing with anchor
console.log('Test 8: Hit testing (contains) with center anchor');
const el8 = new UIElement({ x: 0, y: 0, width: 200, height: 100, anchorX: 'center', anchorY: 'middle' });
const bounds8 = el8.getWorldPosition();
const hitX = bounds8.x + bounds8.width / 2;
const hitY = bounds8.y + bounds8.height / 2;
const contains = el8.contains(hitX, hitY);
console.log('Element at x=' + bounds8.x + ', y=' + bounds8.y + ', w=' + bounds8.width + ', h=' + bounds8.height);
console.log('Test point at center: x=' + hitX + ', y=' + hitY);
console.log('Expected: true');
console.log('Actual: ' + contains);
console.log('Pass: ' + (contains === true ? '✓' : '✗') + '\n');

console.log('=== All Tests Complete ===');
