# 图片懒加载

使用原生方法 [IntersectionObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API)

通过检测所有的图片是否在当前窗口可见
然后通过 `new IntersectionObserver(callback, options)` 来设置加载函数

监听过程中检测元素的 `isIntersecting` 是否存在，如果存在，说明当前元素进入了检测范围了
然后取消当前元素的监听（因为加载了图片后就不需要监听了），这时候就可以加载了图片了。

总体源码来自 [lazyload](https://github.com/tuupola/lazyload)

剥离了核心的函数出来，如果不兼容 `IntersectionObserver`，就直接循环所有的图片元素，将图片加载出来

## 其他方案
可以监听`onscroll`事件，如果到了当前图片可见的位置，就加载当前图片，日常会使用 `getBoundingClientRect`函数
`getBoundingClientRect` 获取元素可见的范围
```js
let elem = document.getElementById('elem');
let rect = elem.getBoundingClientRect();
```
需要考虑两种情况，一种是当前元素在window视口，一种是当前元素在父元素中（可能父元素中需要滑动才能显示子元素）
```js
if (containment) {
      const containmentDOMRect = containment.getBoundingClientRect();
      containmentRect = {
        top: containmentDOMRect.top,
        left: containmentDOMRect.left,
        bottom: containmentDOMRect.bottom,
        right: containmentDOMRect.right
      };
    } else {
      containmentRect = {
        top: 0,
        left: 0,
        bottom: window.innerHeight || document.documentElement.clientHeight,
        right: window.innerWidth || document.documentElement.clientWidth
      };
    }
```
因为元素可见就开始加载，所以只需要部分可见即可，不需要全部可见
> 全部可见的条件为
```js
const visibilityRect = {
      top: rect.top >= containmentRect.top,
      left: rect.left >= containmentRect.left,
      bottom: rect.bottom <= containmentRect.bottom,
      right: rect.right <= containmentRect.right
    };
```
部分可见的条件为
```js
let partialVisible =
        rect.top <= containmentRect.bottom &&
        rect.bottom >= containmentRect.top &&
        rect.left <= containmentRect.right &&
        rect.right >= containmentRect.left;
```
但既然是图片加载，当然就是图片的`rect.top >= containmentRect.top` 就可以了
应该不是，如果当前页面宽度大于屏幕宽度，用户右移才能显示图片的时候呢，所以还是使用 `partialVisible` 吧

这个方案参考 [react-visibility-sensor](https://github.com/joshwnj/react-visibility-sensor)

## 其他
Q: 日常会问到那么初始设置的图片的占位大小如何设定\
A: 这个可以在图片上传的时候，获取到图片的大小，这样就可以在渲染页面的时候，设置占位符图片的大小