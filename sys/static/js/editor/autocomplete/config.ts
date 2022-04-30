import {Completion, CompletionSource} from "./completion"
import {Facet, combineConfig, EditorState} from "../state/index"

export interface CompletionConfig {
    /** When enabled (defaults to true), autocompletion will start whenever the user types something that can be completed. */
    activateOnTyping?: boolean
    /** Override the completion sources used. */
    override?: readonly CompletionSource[] | null,
    /** The maximum number of options to render to the DOM. */
    maxRenderedOptions?: number,
    /** Set this to false to disable the [default completion keymap]{@link completionKeymap}.  */
    defaultKeymap?: boolean,
    /** Completions are shown below the cursor when there is space */
    aboveCursor?: boolean,
    /** This can be used to add additional CSS classes to completion options. */
    optionClass?: (completion: Completion) => string,
    /** the library will render icons based on the completion's [type]{@link Completion.type} */
    icons?: boolean,
    /** This option can be used to inject additional content into option. */
    addToOptions?: {render: (completion: Completion, state: EditorState) => Node | null, position: number}[]
}

export const completionConfig = Facet.define<CompletionConfig, Required<CompletionConfig>>({
    combine(configs) {
        return combineConfig(configs, {
            activateOnTyping: true,
            override: null,
            maxRenderedOptions: 100,
            defaultKeymap: true,
            optionClass: () => "",
            aboveCursor: false,
            icons: true,
            addToOptions: []
        }, {
            defaultKeymap: (a, b) => a && b,
            icons: (a, b) => a && b,
            optionClass: (a, b) => c => joinClass(a(c), b(c)),
            addToOptions: (a, b) => a.concat(b)
        })
    }
})

function joinClass(a: string, b: string) {
    return a ? b ? a + " " + b : a : b
}
