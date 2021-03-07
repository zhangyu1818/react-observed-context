import * as React from 'react'

export type ContextHook<HookReturn, State = any> = (initialState?: State) => HookReturn

export type ProviderProps<State = any> = {
  initialState?: State
}

export type ObservedKeys<State = any> = keyof State | (keyof State)[] | false

const MAX_SIGNED_31_BIT_INT = 1073741823
const bitsArray = Array(31)
  .fill(0)
  .map((_value, index) => Math.pow(2, index))

export default function createObservedContext<HookReturn, State = any>(
  useHook: ContextHook<HookReturn, State>,
  stateKey: string
) {
  let keyBitsMap: { [key: string]: number } = {}

  function calculateKeys(keys?: ObservedKeys): number | false | undefined {
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
      Object.keys(newValue[stateKey]).forEach((key) => {
        if (oldValue[stateKey][key] !== newValue[stateKey][key]) {
          result |= keyBitsMap[key]
        }
      })
      return result
    } catch (e) {
      return MAX_SIGNED_31_BIT_INT
    }
  }

  // @ts-ignore
  const InternalContext = React.createContext<HookReturn>({} as HookReturn, calculateChangedBits)

  const Provider: React.FC<ProviderProps<State>> = ({ children, initialState }) => {
    const state = useHook(initialState)
    const initial = state[stateKey]
    if (typeof initial === 'object' && initial !== null) {
      keyBitsMap = {}
      Object.keys(initial).forEach((key, index) => {
        keyBitsMap[key] = bitsArray[index]
      })
    }

    return <InternalContext.Provider value={state}>{children}</InternalContext.Provider>
  }

  const useObservedState = (key?: ObservedKeys<State>): HookReturn => {
    const observedBits = calculateKeys(key)
    // @ts-ignore
    return React.useContext(InternalContext, observedBits)
  }

  return {
    Provider,
    useObservedState,
  }
}
