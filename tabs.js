"use_strict"
/**
 * Generic tabbed browsing Gui.
 */

const html = require("./html")
const Mirrorable = require("./mirrorable")
const Gui = require("./gui")

const Tabs = module.exports = class Tabs extends Mirrorable {
  constructor (options = {}) {
    super()
    this.nav = new Tabs.Nav(this)
    this.selector = new Tabs.Selector(this)
    this.view = new Tabs.View(this)
    if (options.nav) html.append(options.nav, this.nav)
    if (options.selector) html.append(options.selector, this.selector)
    if (options.view) html.append(options.view, this.view)
  }

  add (id, name, content, select) {
    this.push(new Tabs.Content(this, id, name, content))
    if (select || !this.selected) this.select(id)
  }

  remove (id) {
    const index = this.findIndex(content => content.id === id)
    const content = this[index]
    if (this.selected === content) this.select()
    if (index != null) this.splice(index, 1)
  }

  clear () {
    this.splice(0, this.length)
  }

  select (id) {
    if (this.selected) {
      this.selected.destroy()
      if (this.selected.link) this.selected.link.className = ""
    }
    const selected = this.find(content => content.id === id)
    if (selected) {
      selected.generate()
      if (selected.link) selected.link.className = "selected"
    }
    this.selected = selected
    this.trigger("select", id)
  }
}

Tabs.Content = class TabsContent {
  constructor (tabs, id, name, content) {
    this.id = id
    this.name = name
    this.content = content
    if (content.parentNode && content.parentNode.removeChild) {
      content.parentNode.removeChild(content)
    }

    this.select = () => tabs.selected === this || tabs.select(id)

    if (name) {
      this.link = html.create("a", { onclick: this.select }, name)
      this.option = html.create(
        "option",
        { onselect: this.select, value: id },
        name
      )
    }
  }

  generate () {
    if (typeof this.content === "function") {
      this.component = this.content()
      this.domNode = html.convert(this.component)
    } else if (!this.domNode) {
      this.domNode = html.convert(this.content)
    }
  }

  destroy () {
    if (this.component && this.component.destroy) this.component.destroy()
  }
}

Tabs.Nav = class TabsNav extends Gui {
  constructor (tabs) {
    super(`<nav class="TabsNav">%links...</nav>`)
    this.links = tabs.mirror(tab => tab.link)
  }
}

Tabs.Selector = class TabsSelector extends Gui {
  constructor (tabs) {
    super(
      `<select class="TabsSelector" %onchange value=%selected>%options...</select>`
    )
    this.onchange = event => event.target.selectedOptions[0].onselect()
    this.options = tabs.mirror(content => content.option)
    tabs.project("selected", this, content => content && content.id)
  }
}

Tabs.View = class TabsView extends Gui {
  constructor (tabs) {
    super(`<div class="TabsView">%content</div>`)
    tabs.link("selected", this, "content", x => x && x.domNode)
  }
}
