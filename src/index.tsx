import * as React from 'react'

export type ObservedKeys<State> = keyof State | (keyof State)[] | false

export type InternalHookReturn<State> = [State, React.Dispatch<React.SetStateAction<State>>]

const MAX_SIGNED_31_BIT_INT = 1073741823
const bitsArray = Array(31)
  .fill(0)
  .map((_value, index) => Math.pow(2, index))

function useInternalHook<State>(initialState: State) {
  return React.useState(initialState)
}

export default function createObservedContext<State>(initialState: State) {
  let keyBitsMap: { [key: string]: number } = {}

  function calculateKeys(keys?: ObservedKeys<State>): number | false | undefined {
    let result = 0
    const calculate = (key) => {
      if (key in keyBitsMap) {
        const bit = keyBitsMap[key]
        result |= bit
      } else {
        result = MAX_SIGNED_31_BIT_INT
      }
    }
    if (typeof keys === 'string') {
      calculate(keys)
    } else if (Array.isArray(keys)) {
      keys.forEach(calculate)
    } else if (keys === false || keys === undefined) {
      return keys
    }
    return result
  }

  function calculateChangedBits(oldValue: State, newValue: State): number {
    try {
      let result = 0
      Object.keys(newValue[0]).forEach((key) => {
        if (oldValue[0][key] !== newValue[0][key]) {
          result |= keyBitsMap[key]
        }
      })
      return result
    } catch (e) {
      return MAX_SIGNED_31_BIT_INT
    }
  }

  const InternalContext = React.createContext<InternalHookReturn<State>>(
    [],
    // @ts-ignore
    calculateChangedBits
  )

  const Provider: React.FC = ({ children }) => {
    const [state, setState] = useInternalHook(initialState)
    if (typeof state === 'object' && state !== null) {
      keyBitsMap = {}
      Object.keys(state).forEach((key, index) => {
        keyBitsMap[key] = bitsArray[index]
      })
    }

    return <InternalContext.Provider value={[state, setState]}>{children}</InternalContext.Provider>
  }

  const useObservedState = (key?: ObservedKeys<State>) => {
    const observedBits = calculateKeys(key)
    return React.useContext<InternalHookReturn<State>>(
      InternalContext,
      // @ts-ignore
      observedBits
    )
  }

  return {
    Provider,
    useObservedState,
  }
}
