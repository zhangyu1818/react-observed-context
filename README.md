# react-observed-context

利用React隐藏特性来让Context只在当前组件使用字段改变时更新组件。

## 使用

```shell
yarn add react-observed-context
```

## 示例

```jsx
import { useState } from "react";
import { render } from "react-dom";

import createObservedContext from "react-observed-context";

const useFormState = () => {
  const [state, setState] = useState({ user: "", password: "" });
  return { state, setState };
};

const Context = createObservedContext(useFormState, "state");

const Input = ({ name }) => {
  const { state, setState } = Context.useObservedState(name);
  return (
    <input
      type="text"
      value={state[name]}
      onChange={({ target }) =>
        setState((prev) => ({ ...prev, [name]: target.value }))
      }
    />
  );
};

function App() {
  return (
    <Context.Provider>
      <Input name="user" />
      <Input name="password" />
    </Context.Provider>
  );
}

render(<App />, document.getElementById("root"));

```

## API

**createObservedContext**

```javascript
/**
 * useHook 自定义hook
 * stateKey 数据所在的key
 */
function createObservedContext(useHook, stateKey)
```

**<Context.Provider />**

`initialState`会传递给自定义hook

```jsx
<Context.Provider initialState={state}>
  { ... }
</Context.Provider>
```

**Context.useObservedState**

```javascript
/**
 * key 观察的字段，数组或字符串，false为不观察
 */
function useObservedState(key)
```



## 警告

此功能依赖React非稳定性`future`，开发环境控制台会有`warning`警告。

最多可观察31个字段。