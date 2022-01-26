import { itemById, nextById, prevById, queryElements } from "@ui-machines/dom-utils"
import { first, last } from "@ui-machines/utils"
import { MachineContext as Ctx } from "./tabs.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getTablistId: (ctx: Ctx) => `tabs-${ctx.uid}-tablist`,
  getPanelId: (ctx: Ctx, id: string) => `tabs-${ctx.uid}-tabpanel-${id}`,
  getTabId: (ctx: Ctx, id: string) => `tabs-${ctx.uid}-tab-${id}`,

  getTablistEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getTablistId(ctx)),
  getPanelEl: (ctx: Ctx, id: string) => dom.getDoc(ctx).getElementById(dom.getPanelId(ctx, id)),
  getTabEl: (ctx: Ctx, id: string) => dom.getDoc(ctx).getElementById(dom.getTabId(ctx, id)),
  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getTablistId(ctx))
    const selector = `[role=tab][data-ownedby='${ownerId}']`
    return queryElements(dom.getTablistEl(ctx), selector)
  },
  getFirstEl: (ctx: Ctx) => first(dom.getElements(ctx)),
  getLastEl: (ctx: Ctx) => last(dom.getElements(ctx)),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), dom.getTabId(ctx, id), ctx.loop),
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), dom.getTabId(ctx, id), ctx.loop),
  getRectById: (ctx: Ctx, id: string) => {
    const tab = itemById(dom.getElements(ctx), dom.getTabId(ctx, id))
    return {
      left: tab?.offsetLeft ?? 0,
      width: tab?.offsetWidth ?? 0,
    }
  },
}
