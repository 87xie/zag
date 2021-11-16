import { createMachine, guards } from "@ui-machines/core"
import { addDomEvent } from "../utils/dom-event"
import { noop } from "../utils/fn"
import { dom } from "./toast.dom"
import { ToastMachineContext, ToastMachineState, ToastOptions } from "./toast.types"
import { getToastDuration } from "./toast.utils"

const { not, and, or } = guards

export function createToastMachine(options: ToastOptions = {}) {
  const { type = "info", role = "status", duration, id = "toast", placement = "top", ...rest } = options

  const timeout = getToastDuration(duration, type)

  const toast = createMachine<ToastMachineContext, ToastMachineState>(
    {
      id,
      initial: "active",
      context: {
        type,
        role,
        "aria-live": "polite",
        id,
        duration: timeout,
        progress: { max: timeout, value: timeout },
        pauseOnPageIdle: false,
        pauseOnHover: false,
        placement,
        ...rest,
      },

      on: {
        UPDATE: [
          {
            guard: and("hasTypeChanged", "isLoadingType"),
            target: "visible",
            actions: "setContext",
          },
          {
            guard: or("hasDurationChanged", "hasTypeChanged"),
            target: "active:temp",
            actions: "setContext",
          },
          {
            actions: "setContext",
          },
        ],
      },

      states: {
        "active:temp": {
          after: {
            // force a re-entry into the "active" state
            NOW: "active",
          },
        },

        visible: {
          activities: "trackDocumentVisibility",
          on: {
            RESUME: { guard: not("isLoadingType"), target: "active" },
            DISMISS: "dismissing",
            REMOVE: {
              target: "inactive",
              actions: "notifyParentToRemove",
            },
          },
        },

        active: {
          activities: "trackDocumentVisibility",
          after: {
            VISIBLE_DURATION: "dismissing",
          },
          every: [
            {
              guard: not("isLoadingType"),
              actions: "setProgressValue",
              delay: "PROGRESS_INTERVAL",
            },
          ],
          on: {
            DISMISS: "dismissing",
            PAUSE: {
              target: "visible",
              actions: "setDurationToProgress",
            },
            REMOVE: {
              target: "inactive",
              actions: "notifyParentToRemove",
            },
          },
        },

        dismissing: {
          entry: "clearProgressValue",
          after: {
            DISMISS_DURATION: {
              target: "inactive",
              actions: "notifyParentToRemove",
            },
          },
        },

        inactive: {
          entry: "invokeOnClose",
          type: "final",
        },
      },
    },
    {
      activities: {
        trackDocumentVisibility(ctx, _evt, { send }) {
          if (!ctx.pauseOnPageIdle) return noop
          const doc = dom.getDoc(ctx) as Document & { msHidden?: boolean; webkitHidden?: string }
          return addDomEvent(doc, "visibilitychange", () => {
            const isPageHidden = doc.hidden || doc.msHidden || doc.webkitHidden
            send(isPageHidden ? "PAUSE" : "RESUME")
          })
        },
      },
      guards: {
        isLoadingType: (ctx) => ctx.type === "loading",
        hasTypeChanged: (ctx, evt) => evt.type != null && evt.type !== ctx.type,
        hasDurationChanged: (ctx, evt) => evt.duration != null && evt.duration !== ctx.duration,
      },
      delays: {
        VISIBLE_DURATION: (ctx) => ctx.duration,
        DISMISS_DURATION: 1000,
        PROGRESS_INTERVAL: 10,
        NOW: 0,
      },
      actions: {
        setDurationToProgress(ctx) {
          ctx.duration = ctx.progress?.value
        },
        setProgressValue(ctx) {
          ctx.progress.value -= 10
        },
        clearProgressValue(ctx) {
          ctx.progress.value = 0
        },
        notifyParentToRemove() {
          toast.sendParent({ type: "REMOVE_TOAST", id: toast.id })
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        setContext(ctx, evt) {
          const { duration: newDuration, type: newType } = evt.toast
          const duration = getToastDuration(newDuration, newType)

          for (const key in evt.toast) {
            ctx[key] = evt.toast[key]
          }

          if (newType && newDuration == null) {
            ctx.duration = duration
            ctx.progress!.value = duration
          }
        },
      },
    },
  )

  return toast
}
