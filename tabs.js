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

  add (id, name, node, select) {
    this.push(new Tabs.Content(this, id, name, node))
    if (select) this.select(id)
  }

  remove (id) {
    const index = this.findIndex(content => content.id === id)
    if (index != null) this.splice(index, 1)
  }

  select (id) {
    if (this.selected) this.selected.link.className = ""
    this.selected = this.find(content => content.id === id)
    if (this.selected) {
      this.selected.link.className = "selected"
    }
    this.trigger("select", id)
  }
}

Tabs.Content = class TabsContent {
  constructor (tabs, id, name, content) {
    this.id = id
    this.name = name
    this.content = content
    this.domNode = html.convert(content)
    this.select = () => tabs.selected === this || tabs.select(id)
    this.link = html.create("a", { onclick: this.select }, name)
    this.option = html.create(
      "option",
      { onselect: this.select, value: id },
      name
    )
  }
}

Tabs.Nav = class TabsNav extends Gui {
  constructor (tabs) {
    super("<nav>%links...</nav>")
    this.links = tabs.mirror(tab => tab.link)
  }
}

Tabs.Selector = class TabsSelector extends Gui {
  constructor (tabs) {
    super("<select %onchange value=%selected>%options...</select>")
    this.onchange = event => event.target.selectedOptions[0].onselect()
    this.options = tabs.mirror(content => content.option)
    tabs.project("selected", this, content => content && content.id)
  }
}

Tabs.View = class TabsView extends Gui {
  constructor (tabs) {
    super("<div>%content</div>")
    tabs.link("selected", this, "content", x => x && x.domNode)
  }
}
