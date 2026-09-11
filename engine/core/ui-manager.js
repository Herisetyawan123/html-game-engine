/* Manages the set of active UI elements for the current scene and wires
   them into the InputManager as a single group (so popups can be added
   and torn down atomically). */
class UIManager {
  constructor(inputManager) { this.input = inputManager; this.elements = []; }
  add(el, index = this.elements.length) {
    const insertAt = Math.max(0, Math.min(index, this.elements.length));
    this.elements.splice(insertAt, 0, el);
    this.input.register(el);
    return el;
  }
  remove(el) {
    // check if el is a key and find the element by key
    if (typeof el === 'string') {
      const key = el;
      el = this.elements.find(e => e.key === key);
      if (!el) return; // element with the given key not found
    }
    const i = this.elements.indexOf(el);
    if (i >= 0) this.elements.splice(i, 1);
    this.input.unregister(el);
  }
  addPopup(popup) {
    this.add(popup);
    popup.children.forEach(c => this.add(c));
    return popup;
  }
  removePopup(popup) {
    this.remove(popup);
    popup.children.forEach(c => this.remove(c));
  }
  clear() { this.elements.forEach(el => this.input.unregister(el)); this.elements = []; }
  draw(ctx) { this.elements.forEach(el => el.draw(ctx)); }
  getElementByKey(key) { 
    console.log(this.elements)
    return this.elements.find(el => el.key === key); 
  }
}