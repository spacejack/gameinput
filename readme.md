# gameinput

High-level library for game-style inputs. Abstracts over:

* Keyboard
* Gamepad
* Elements (click/touch)

## Example Usage

```typescript
import * as gameinput from 'gameinput'

// First register an input group of keys, pad controls, etc. by name:
gameinput.create({
	name: 'forward',
	keyCodes: [38, 87], // up-arrow, W
	elements: Array.from(
		document.querySelectorAll('button.forward')
	),
	gamepadControls: [{
		gamepadId: gamepadId,
		type: 'axis',
		axisId: 0,
		axisSign: -1
	}]
})

// Then poll with:
// (Required to get fresh Gamepad data)
gameinput.poll()

// Get current pressed state (boolean) or value (number from 0-1)
console.log(`forward ${gameinput.pressed('forward') ? 'is' : 'is not'} pressed`)
console.log(`forward value: ${gameinput.value('forward').toFixed(3)}`)

// Or listen for press/release events:
gameinput.on('forward', 'press', () => {
	console.log('forward was pressed')
})
gameinput.on('forward', 'release', () => {
	console.log('forward was released')
})

// Cleanup this input by calling:
gameinput.destroy('forward')
```

Note that calling create again for the same name will replace the previous definition and any listeners for that name will no longer recieve messages.
