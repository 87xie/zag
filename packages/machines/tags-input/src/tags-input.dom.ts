import { indexOfId, nextById, prevById, queryElements } from "@ui-machines/dom-utils"
import { MachineContext as Ctx } from "./tags-input.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => `tags-input-${ctx.uid}-root`,
  getInputId: (ctx: Ctx) => `tags-input-${ctx.uid}-input`,
  getEditInputId: (ctx: Ctx) => `${ctx.editedId}-input`,
  getClearButtonId: (ctx: Ctx) => `tags-input-${ctx.uid}-clear-btn`,
  getHiddenInputId: (ctx: Ctx) => `tags-input-${ctx.uid}-hidden-input`,

  getTagId: (ctx: Ctx, id: string | number) => `tags-input-${ctx.uid}-tag-${id}`,
  getTagDeleteBtnId: (ctx: Ctx, id: string | number) => `${dom.getTagId(ctx, id)}-delete-btn`,
  getTagInputId: (ctx: Ctx, id: string | number) => `${dom.getTagId(ctx, id)}-input`,

  getRootEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getRootId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,
  getEditInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getEditInputId(ctx)) as HTMLInputElement | null,
  getTag: (ctx: Ctx, id: string) => dom.getDoc(ctx).getElementById(dom.getTagId(ctx, id)),
  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `[data-ownedby=${ownerId}]`
    return queryElements(dom.getRootEl(ctx), selector)
  },
  getClosestFormEl: (ctx: Ctx) => dom.getInputEl(ctx)?.closest("form"),

  getIndexOfId: (ctx: Ctx, id: string) => indexOfId(dom.getElements(ctx), id),
  isInputFocused: (ctx: Ctx) => dom.getDoc(ctx).activeElement === dom.getInputEl(ctx),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getLastEl: (ctx: Ctx) => dom.getElements(ctx)[dom.getElements(ctx).length - 1],
  getPrevEl: (ctx: Ctx, id: string) => prevById(dom.getElements(ctx), id, false),
  getNextEl: (ctx: Ctx, id: string) => nextById(dom.getElements(ctx), id, false),

  getFocusedTagValue: (ctx: Ctx) => {
    if (!ctx.focusedId) return null
    const idx = dom.getIndexOfId(ctx, ctx.focusedId)
    if (idx === -1) return null
    return dom.getElements(ctx)[idx].dataset.value ?? null
  },
}
