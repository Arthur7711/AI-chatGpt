<template>
    <div class="complete-input-container">
        <div
            v-if="hintIsShown && hintTexts.length && inScroll(hintX, hintY)"
            :style="{'top': hintY - this.scrollY + 'px', 'left': hintX - this.scrollX + 'px'}"
            class="hint"
        >
            <div
                v-for="text in hintTexts"
                class="hint-row"
                :style="{'background-color': text.color}"
            >
                "<code>{{ text.title }}</code>" - {{ text.percent }}
            </div>
        </div>
        <div
            class="highlight"
        >
            <div
                v-for="highlight in highlights"
            >
                <div
                    v-if="inScroll(highlight.x, highlight.y)"
                    :style="{
                    'top': highlight.y - this.scrollY + 10 + 'px',
                    'left': highlight.x - this.scrollX + 10 + 'px',
                    'width': highlight.width + 'px',
                    'height': highlight.height + 'px',
                    'background-color': highlight.color,
                }"
                    class="highlight-item"
                >

                </div>
            </div>
        </div>
        <textarea
            ref="textarea"
            class="input"
            @paste="handleInputPrevent"
            @keydown="handleInputPrevent"
            @keyup="handleInputPrevent"
            @input.prevent="handleInputPrevent"
            @input="handleInput"
            @mouseup="handleMouseUp"
            @scroll="onScroll"
        >{{ text }}</textarea>
    </div>
</template>

<script>

export default {
    name: "PlaygroundCompleteInput",

    props: {
        text: '',
        isDisabled: false,
        endUserPrompt: 0,
        tokens: {
            type: Array,
            required: true,
        },
        logprobs: {
            type: Array,
            required: true,
        },
    },

    data() {
        return {
            hoverTimeout: null,
            hintX: 0,
            hintY: 0,
            hintIsShown: false,
            hintTexts: [],
            highlights: [],
            scrollX: 0,
            scrollY: 0,
        };
    },

    watch: {
        text: function () {
            this.$refs.textarea.value = this.text;
        },
        logprobs: function () {
            if (this.tokens.length < this.highlights.length) {
                this.highlights = [];
                return;
            }

            const textarea = this.$refs.textarea;

            let startIndex = this.endUserPrompt;
            for (let i = 0; i < this.tokens.length; i++) {
                if (!(i in this.tokens) || i in this.highlights) {
                    continue;
                }

                let endIndex = startIndex + this.tokens[i].length;

                const startTokenPosition = this.getCursorWordPosition(textarea, startIndex, false);
                const endTokenPosition = this.getCursorWordPosition(textarea, endIndex, true);

                let percent = 0;
                let sum_logprobs = Object.values(this.logprobs[i]).reduce((a,b) => a + b, 0);

                for (let logprob_key in this.logprobs[i]) {
                    if (this.tokens[i] !== logprob_key) {
                        continue;
                    }

                    percent = this.logprobs[i][logprob_key] / sum_logprobs;
                    percent = 1 - percent;
                    break;
                }

                if (endTokenPosition.x - startTokenPosition.x < 0 || endTokenPosition.y - startTokenPosition.y < 0) {
                    this.highlights[i] = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        color: '#00000000',
                    };
                } else {
                    this.highlights[i] = {
                        x: startTokenPosition.x,
                        y: startTokenPosition.y,
                        width: endTokenPosition.x - startTokenPosition.x,
                        height: endTokenPosition.y - startTokenPosition.y,
                        color: this.floatToHexColor(percent) + '55',
                    };
                }

                startIndex = endIndex;
            }
        }
    },

    methods: {
        onScroll(event) {
            this.scrollY = event.target.scrollTop;
            this.scrollX = event.target.scrollLeft;
        },
        inScroll(x, y) {
            return x - this.scrollX <= this.$refs.textarea.clientWidth
                && x - this.scrollX >= 0
                && y - this.scrollY <= this.$refs.textarea.clientHeight
                && y - this.scrollY >= 0;
        },
        handleInputPrevent(event) {
            if (this.isDisabled) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        },
        handleInput() {
            this.highlights = [];
            this.hintIsShown = false;

            this.$emit('changed-text', this.$refs.textarea.value);
        },
        handleMouseUp(event) {
            clearTimeout(this.hoverTimeout);

            this.hintIsShown = false;

            this.hoverTimeout = setTimeout(() => {
                this.handleHover(event);
            }, 50); // Delay in milliseconds (e.g. 500ms)
        },
        handleHover(event) {
            // Get the hovered word
            const hovered = this.getHoveredToken(event.target);

            if (hovered.tokenIndex === -1) {
                return;
            }

            const textarea = this.$refs.textarea

            const cursorPosition = this.getCursorWordPosition(textarea, hovered.index);

            this.hintIsShown = true;
            this.hintX = cursorPosition.x + 6;
            this.hintY = cursorPosition.y + 10;

            this.hintTexts = [];

            const sum_logprobs = Object.values(this.logprobs[hovered.tokenIndex]).reduce((a,b) => a + b, 0);

            for (let logprob_key in this.logprobs[hovered.tokenIndex]) {
                let percent = this.logprobs[hovered.tokenIndex][logprob_key] / sum_logprobs;
                percent = 1 - percent;
                percent *= 100;

                let logprob_title = logprob_key;
                logprob_title = logprob_title.replaceAll('\n', '↵');

                this.hintTexts.push({
                    title: logprob_title,
                    percent: percent.toFixed(2) + '%',
                    color: this.tokens[hovered.tokenIndex] === logprob_key ? this.floatToHexColor(percent / 100) + '77' : '#00000000',
                });
            }
        },

        getHoveredToken(textarea) {
            // Get the caret position
            const caretPosition = textarea.selectionStart;

            if (caretPosition <= this.endUserPrompt || this.tokens.length === 0 || this.logprobs.length === 0) {
                return { index: -1, tokenIndex: -1, token: '' };
            }

            let tokensLength = this.endUserPrompt;
            for (let i = 0; i < this.tokens.length; i++) {
                let endToken = tokensLength + this.tokens[i].length;

                if (caretPosition >= tokensLength && caretPosition <= endToken - 1) {
                    return { index: tokensLength, tokenIndex: i, token: this.tokens[i] };
                }

                tokensLength = endToken;
            }

            return { index: -1, tokenIndex: -1, token: '' };
        },

        getCursorWordPosition(textarea, index, with_y_offset = true) {
            // Get the computed style of the textarea
            const style = window.getComputedStyle(textarea);

            // Get the line height property
            const lineHeight = parseInt(style.getPropertyValue("line-height"));

            let beforeTokenLine = '';
            let y = 0;
            for (let i = index - 1; i >= 0; i--) {
                if (textarea.value[i] === '\n') {
                    y++;
                } else if (y === 0) {
                    beforeTokenLine += textarea.value[i];
                }
            }

            if (with_y_offset) {
                y += 1;
            }

            return {
                x: this.getWordWidth(beforeTokenLine, lineHeight),
                y: y * lineHeight,
            }
        },

        getWordWidth(word, lineHeight) {
            const span = document.createElement('span')
            span.innerText = word
            span.style.whiteSpace = 'pre'
            span.style.visibility = 'hidden'
            span.style.position = 'absolute'
            span.style.lineHeight = lineHeight + 'px'

            document.body.appendChild(span)
            const width = span.offsetWidth
            document.body.removeChild(span)

            return width
        },
        floatToHexColor(value) {
            // Convert the float value to an integer between 0 and 255
            const intValue = Math.round(value * 255);

            // Calculate the red and green components
            const red = 255 - intValue;
            const green = intValue;

            // Convert the red and green values to hexadecimal strings
            const redHex = red.toString(16).padStart(2, '0');
            const greenHex = green.toString(16).padStart(2, '0');

            // Construct the hexadecimal color value
            return '#' + redHex + greenHex + '00';
        }
    },
    beforeUnmount() {
        clearTimeout(this.hoverTimeout);
    },
};
</script>

<style scoped>

.complete-input-container {
    position: relative;
    height: 75%;
}

.highlight {
    z-index: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.highlight-item {
    position: absolute;
    z-index: 0;
}

.hint {
    position: absolute;
    z-index: 2;
    padding: 3px 16px;
    background: #343541;
    color: #fff;
    border-radius: 5px;
    border: 1px solid #858585;
    box-shadow: 0 2px 10px 1px rgb(0 0 0 / 44%);
}

.hint-row {

}

.hint-row.selected {
    background: #ff000082;
}

.input {
    border: 1px solid #ccc;
    padding: 10px;
    position: relative;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    color: #fff;
    resize: none;
    white-space: nowrap;
    overflow-x: auto;
}

.lines-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.line {
    min-height: 24px;
}
</style>