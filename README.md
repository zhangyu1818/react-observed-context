# react-observed-context

> 这个功能只在16和17可用，18不可用了。
> 
> 具体原理可查看[React中Context的精准更新](https://juejin.cn/post/6936576203612651534)。

利用React隐藏特性来让Context只在当前组件使用字段改变时更新组件。

## 使用

```shell
yarn add react-observed-context
```

## 示例

```jsx
import { render } from "react-dom";

import createObservedContext from "react-observed-context";


const Context = createObservedContext({ user: "", password: "" });

const Input = ({ name }) => {
  const [ state, setState ]= Context.useObservedState(name);
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
 * baseState 默认值
 */
function createObservedContext(baseState)
```

**<Context.Provider />**

```jsx
<Context.Provider>
  { children... }
</Context.Provider>
```

**Context.useObservedState**

```javascript
/**
 * key 观察的字段，数组或字符串，false为不观察，如自定义第二个setState
 */
function useObservedState(key)
```

## 警告

此功能依赖React非稳定性`future`，开发环境控制台会有`warning`警告。

最多可观察31个字段。
