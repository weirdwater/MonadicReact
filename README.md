# Introduction
This project makes it easier to create, compose, and re-use React controllers and containers without losing type safety, even when routing.

It does so by defining a monadic interface around React components. This interface is then used to support construction of a series of useful combinators. The library is written in TypeScript, and is provided with definition files: it can be used from both plain JavaScript and TypeScript.

The net result is a painless React development experience. Complex concurrency, state machines, and intricate data flow relations between components can be modelled explicitly and easily. For example, with monadic react, the following become much simpler to define:
- [data flows](../master/samples/Client/samples/multiselector.tsx)
- [forms](../master/samples/Client/samples/form.ts)
- [concurrency](../master/samples/Client/samples/toggles.tsx)

and much more.

## Installation
Installation is the usual `npm install monadic_react`.

## Sample usage
To use the application, create one or more components of type `C<void>`, for example:

```
let my_component : C<void> =
string("view")("Hello world of monads!").ignore()
```

The component is then wrapped in a page for the router. Let us keep things easy and define a route which matches everything:

```
let menu_page = () : Route<{}> => ({
url: fallback_url(),
page: (_:{}) => my_component
})
```

The component can then be instantiated by invoking the application constructor and router:

```
<div className="component">
{
application("edit", window.location.href, "", Promise.resolve([main_page()]))
}
</div>
```

By working on the definition of `my_component` it is possible to create much more complex applications. For example, let us
chain two components together:

```
let my_component : C<void> =
multi_selector<number>("checkbox",x => x.toString())([1, 3, 5]).then(`multi_selector`, n =>
string("view")(JSON.stringify(n.toArray())).ignore())
```

In the sample above we have used the `then` operator in order to feed the output of the multi-selector in the string renderer.

## React monad
The react monad is based on the simple idea that a non-trivial react component will eventually produce data, which is usually fed into another component.

By focusing on the flow of data generated by react components, instead of what they do on the page and how they are rendered, we focus on how components are connected together in a large network of related functionality. This removes the need for a lot of glue code which just passes information around, while preserving useful properties such as referential transparency (components can be designed fully stateless now), and type safety (components have clearly defined and typed boundaries).

For example, the `string` component will produce a string which will be fed into another component, for example a component which assembles data from various input components for later upload.

### Introduction to monads
Monads are a powerful construct tying together mathematics and informatics in an elegant way. The appeal of the highest mathematics, and the clear and useful applicability, have made monads alluring for many developers. Indeed, monads are found in, among others:
- `Promise` in the JavaScript world;
- `flatMap` in the Immutablejs library;
- `LINQ` in C#;
- the Haskell standard library;

and more. Moreover, countless tutorials are found online where people who already found out about this elegant and powerful concept try to share it with others.

At its core, a monad is a generic type `M`, that is `M` was defined along the lines of:

```type M<A> = ...```

When we define a monad in terms of `M`, then it means that we want to be able to instantiate, and use, instances of `M` without having to know anything about its structure.

The simplest operation that we need to be able to perform is creating instances of `M`. This is done with the `unit` operator, which creates an instance of `M<A>` around a value of type `A`, no matter what type `A` actually was:

`unit : A => M<A>`

Given an `M<A>`, we then want to be able to compose it with other instances of `M<B>` which are dependent of it. This dependency is expressed by saying that, in order to get to the instance of `M<B>` that we wish to obtain, we need a value of type `A` which will somehow come out of `M<A>`:

`then : M<A> => (A => M<B>) => M<B>`

(Note: a proper name for `then` would be `bind`, but since it is already a member of function objects, this would lead to mistakes.)

After having defined `unit` and `then`, which are the bare minimum needed in order to be able to have a working monad, we can start thinking in terms of usability of our monad as a library. This usually leads to an "onion" design, with a basic core, surrounded by primitives, surrounded by combinators, templates, etc. As long as primitives, combinators, and templates all yield instances of `M`, they will still be valid input for further thening or applying the other combinators yet again. This is the fundamental principle of composability: a library should make it possible to keep nesting constructs inside each other in order to be flexible and not artificially constraining.

It is useful for some to first learn monads in terms of simple, concrete containers such as `Option` or `List`, and then move on to the more abstract ones such as the present implementation.

### Core
The core of the library, found in file `core.tsx`, contains the definition of the monad itself, `C<A>`. An instance of the monad is a function which takes as input a callback to signify completion, a continuation which will accept a value of type `A` (the data produced by the component, from now on called **output** of the component); finally, the monad returns a `JSX.Element`, which is the actually renderable component:

```
type Cont<A> = (callback:() => void) => (_:A) => void
type C<A> = {
comp:(ctxt:() => Context) => (cont:Cont<A>) => JSX.Element
...
}
```

Using the library does not require interacting with this data type directly: that is done by invoking functions `unit` and `then`:

```
unit = function<A>(x:A, key?:string, dbg?:() => string) : C<A> = ...

then = function<A,B>(key:string, p:C<A>, k:((_:A)=>C<B>), className?:string, dbg?:() => string) : C<B> = ...
```

Notice that, in contrast with the definitions of `unit` and `then` given above, we have some more parameters: since react expects a `key` in order to accelerate the reconciliation process, all generated components may specify an (optional) key. `then` will still work if the key is passed as `undefined`, even though it is not always ideal.

Of course, we can also perform basic transformations on components' data, for example by applying a given transformation function to each output of an existing component. This effectively turns a component of type `C<A>` in a (related) component of type `C<B>`, as long as we provide a function `f:A=>B`:

```
let map: <A, B>(key?: string, dbg?: () => string) => (f: (_: A) => B) => (_: C<A>) => C<B>;
```

Similarly, we can restrict the output of an existing component. This effectively turns a component of type `C<A>` in a (related) component of type `C<A>` which outputs slightly less values of type `A`, as long as we provide a predicate `p:A=>boolean`:

```
filter: <A>(key?: string, dbg?: () => string) => (p: (_: A) => boolean) => (_: C<A>) => C<A>;
```

Note that, given an instance `p:C<A>`, we can directly call some methods on it such as: `p.then(...)`, `p.ignore()`, `p.never<B>()` instead of having to invoke `then(p, ...)`.

### Primitives
Having defined the core operators is just the first step. To be able to do anything actually useful on a webpage, we have defined a series of primitives which encapsulate common HTML constructs as instances of our monad. Each primitive accepts as input the `mode` (`"view" | "edit"`) in order to instantiate the component as editable or just to show its contents.

The primitive then returns a function with, as input, the initial value of the type it manipulates (let's call it `P`) and gives as output a component of that type (that would be `C<P>`).

For example, the `number` primitive, after we have given the `mode` (and optionally the `key`), results in a function `number => C<number>`:

```
number: (mode: Mode, key?: string, dbg?: () => string) => (value: number) => C<number>;
```

The `string` primitive, after we have given the `mode` (and optionally the `key`), results in a function `string => C<string>`:

```
string: (mode: Mode, type?: StringType, key?: string, dbg?: () => string) => (value: string) => C<string>;
```

And so on. There are further primitives for `bool` (`bool => C<bool>`), `date`, `time`, and `date_time` (all three `Moment.Moment) => C<Moment.Moment>`).

### Html
The subsequent layer contains some slightly more articulated html constructs such as labels, divs, buttons, selectors, and more. The basic components just add some tags to the page around, before, or after the html produced by another component. These constructs, which can be seen as **decorators** (or natural transformations if you are categorically inclined) take as input some basic configuration that describe the sort of decoration operation to perform, followed by the function to decorate. The function to decorate always has signature `A => C<B>`. The decorator then returns a result with the same signature, that is `A => C<B>`:

```
label<A, B>(text: string, span_before_content?: boolean, className?: string, key?: string, dbg?: () => string): (p: (_: A) => C<B>) => ((_: A) => C<B>)
h1<A, B>(text: string, className?: string, key?: string, dbg?: () => string): (p: (_: A) => C<B>) => ((_: A) => C<B>)
h2<A, B>(text: string, className?: string, key?: string, dbg?: () => string): (p: (_: A) => C<B>) => ((_: A) => C<B>)
div<A, B>(className?: string, key?: string, dbg?: () => string): (ps: Array<(_: A) => C<void>>) => (p: (_: A) => C<B>) => ((_: A) => C<B>)
overlay<A, B>(key?: string, dbg?: () => string): (ps: Array<(_: A) => C<void>>) => (p: (_: A) => C<B>) => ((_: A) => C<B>)
form<A, B>(className?: string, key?: string, dbg?: () => string): (p: (_: A) => C<B>) => ((_: A) => C<B>)
```

Buttons (and anchors) are slightly simpler in signature. The button, after receiving the configuration parameters, returns a function `A => C<A>`. This function is "interrupted" by the button: before the returned component `C<A>` will return the value of `A` that came in as input, the button must be clicked:

```
button: <A>(label: string, disabled?: boolean, key?: string, className?: string, dbg?: () => string) => (x: A) => C<A>
a: <A>(label: string, disabled?: boolean, key?: string, className?: string, dbg?: () => string) => (x: A) => C<A>
```

Other html components perform an own function. The selectors take as input the candidate items for selection, a `to_string` function which tells how to draw a selectable item, and return the selected item(s):

```
selector: <A>(type: SelectorType, to_string: (_: A) => string, key?: string, dbg?: () => string) => (items: Array<A>, selected_item?: A) => C<A>
multi_selector: <A>(type: MultiSelectorType, to_string: (_: A) => string, key?: string, dbg?: () => string) => (items: Array<A>, selected_items?: Array<A>) => C<Array<A>>
```

Finally, some html components allow the manipulation of links, files, and images (in base64).

```
image: (mode: Mode, key?: string, dbg?: () => string) => (src: string) => C<string>
link: <A>(label: string, url: string, disabled?: boolean, key?: string, dbg?: () => string) => C<void>
file: <A>(mode: Mode, label: string, url: string, disabled?: boolean, key?: string, dbg?: () => string) => C<File>
```

A special mention goes to the *rich text* component, which takes as input a string containing the (serialized) json input needed by a DraftJs rich text editor:

```
rich_text(json_state: string, mode: Mode, key?: string, dbg?: () => string): C<string>
```

### Combinators
Combinators are the next step in the abstraction chain (the next layer in the onion). Combinators are abstract transformers which take as input one or more (functions of) components and yield new (functions of) components.

The simplest combinator is `repeat`. `repeat` takes as input a function `p:A => C<A>`, and returns as output a function `A => C<A>`. The returned function, whenever it receives and input of type `A`, passes it through to `p`. The output of `p` is then given as output of the returned function. The output of `p` is also fed back into `p` itself (which should be smart enough to see that the input is the same, and therefore not yield another output right away):

```
repeat: <A>(key?: string, dbg?: () => string) => (p: (_: A) => C<A>) => (_: A) => C<A>;
```

`repeat` by itself is not very useful. When it really shines is in combination with `any`. `any` accepts as input an array of functions `ps:(A => C<B>)`, and returns as output a single function `A => C<B>`. The returned function passes its own input (`A`) to each function in `ps`. The first of the resulting components that yields a `B` as output gets its output forwarded as the output of `any`:

```
any: <A, B>(key?: string, className?: string, dbg?: () => string) => (ps: ((_: A) => C<B>)[]) => (_: A) => C<B>;
```

Sometimes we need to perform a conversion from a complex datatype (say `A`) into a simpler (say `B`). Suppose we have a series of conversion functions:
- `inb:A => B` to convert an `A` to a `B`;
- `out:A => B => A` to convert the original `A` and a new value of `B` back into `B`.

Then we can convert a function `p:B =>  C<B>` into `A => C<A>`:

```
retract: <A, B>(key?: string, dbg?: () => string) => (inb: (_: A) => B, out: (_: A) => (_: B) => A, p: (_: B) => C<B>) => (_: A) => C<A>;
```

As an example of a retraction, consider:

```
type Person = { Name:string, Surname:string }

let person_name : (_:Person) => C<Person> = p =>
retract<Person>()(p => p.Name, p => n => ({...p, Name:n}), string("view"))
```

When combined with `repeat` and `any`, then we get a form:

```
let person_form =
repeat<Person>("state_repeater")(
any<Person>("field_selector")([
person_name,
person_surname
])
).then("person_form", p =>
...do something with p...)
```

`all`, similarly to `any`, gets as input an array of components and, when all components have yielded an output, all the outputs are passed through:

```
all: <A>(ps: C<A>[], key?: string, dbg?: () => string) => C<A[]>;
```

We can turn a `Promise` into a component by "lifting" it:

```
lift_promise: <A, B>(p: (_: A) => Promise<B>, retry_strategy: RetryStrategy, key?: string, dbg?: () => string) => (_: A) => C<B>;
```

Finally, given a component `p:C<A>`, we can turn into a silent component of type `C<B>` (that is, a component which will never output a value of type `B`) by applying `never` to it:

```
never: <A, B>(p: C<A>, key?: string) => C<B>;
```

### Routing
The library comes with routing included. The function `application`, which instantiates a component, accepts as input a list of routes.

Routes are composed of an `url` and a `page`. The `url` is created by invoking `make_url` on an array of url elements:

```
make_url: <T, K extends keyof T>(template: UrlElement<K>[]) => PartialRetraction<string, T>
```

For example, we could invoke `make_url` as:
- `make_url<{}, never>(["about"])`, which parses url `/about`;
- `make_url<{}, never>(["info"])`, which parses url `/info`;
- `make_url<{}, never>(["info", "team"])`, which parses url `/info/team`.

Parsing an url might also yield some data which has been extracted from the url itself, such as an id. In this case, we must define a data structure to be extracted from the url, and then construct the template so that the proper fields are identified:

```
type Id = { id:number }
make_url<Id, "id">(["customer", { kind:"int", name:"id" }])
```

Note that the above is typesafe. Invalid variations will give a compiler error, for example:
- `make_url<Id, "xxx">(["customer", { kind:"int", name:"id" }])` will complain that `xxx` is not a field of `Id`;
- `make_url<Id, "id">(["customer", { kind:"int", name:"zzz" }])` will complain that `zzz` is not a field of `Id`.


As we have assembled an url which yields a value of type `T`, we can define the page as a function `T => C<void>`. Of course, if parsing has failed and we could not extract a value of type `T` from the url, then we cannot invoke the function and instantiate the page:

```
let about : Route<{}> = {
url: make_url<{}, never>(["about"]),
page: _ => ... definition of about page ...
}
```

`about` as defined above can be used as an entry in the list of routes that are given to the `application` function. Notice that `application` also accepts a `base_url`, which will be kept intact, and the current `slug`, which is used as input for the router.

A component can also set its own url. This is simply achieved by getting the context and then invoking its method `set_url` with a url payload (in the sample below assume variable `t:T` and `K` keys of `T`):

```
get_context().then(s.description, c =>
c.set_url(t, make_url<T, K>([...url elements...])).then(
...)
```

Note that a special url is `fallback_url`, which matches any url. It is usually used for handling errors or making sure that the homepage is accessible even if the address has been wrongly typed.

### Templates
Based on the functionality that we have set up so far, it becomes possible to define templates. Templates usually take as input one or more components, and return themselves a component which coordinates and augments the input components:

```
template : (C<A>, C<B>, C<C>, ...) => C<R>
```

#### Menu template
A very useful template is the `menu`. The entries of the menu are defined as either entries or sub-menus. The sub-menus may only have entries:

```
type MenuEntryValue<A> = { kind:"item", value:A }
type MenuEntrySubMenu<A> = { kind:"sub menu", label:string, children:Array<MenuEntryValue<A>> }
type MenuEntry<A> = MenuEntryValue<A> | MenuEntrySubMenu<A>
```

We can easily construct menu entries by means of utility functions:

```
mk_submenu_entry = function<A>(label:string, children:Array<MenuEntryValue<A>>) : MenuEntrySubMenu<A> { return { kind:"sub menu", label:label, children:children } }
mk_menu_entry = function<A>(v:A) : MenuEntryValue<A> { return { kind:"item", value:v } }
```

The `simple_menu` is a template which takes as input a series of items, a default selection (and sub-selection), and a component `p` that works with the current selection (`p:A => C<B>`). The component `p` is the "inner content" of the menu. The menu itself passes the output of `p` through, therefore the `simple_menu` returns a `C<B>` as result:

```
simple_menu = function<A,B>(type:SimpleMenuType, to_string:(_:A)=>string, key?:string, dbg?:() => string) :
((items:Array<MenuEntry<A>>, p:(_:A)=>C<B>, selected_item?:A, selected_sub_menu?:string) => C<B>)
```

Sample usage is quite intuitive: we define a data structure which we can render, pass a list of such structures to `simple_menu`, and pass an appropriate renderer (in this case the renderer is just stored in the page itself, but this need not be the case):

```
type MyPage = { title:string, content:C<void> }

export let menu_sample : C<void> =
simple_menu<MyPage, void>("side menu", p => p.title, `fictional pages menu`)(
[
{ title:"About", content:string("view")("This page talks about us")},
{ title:"Content", content:string("view")("This page is full of interesting content")}
],
p => p.content
).ignore()

```


#### Form templates
Other very useful templates are the form templates. The form templates take care of typical form-related tasks.

The `simple_inner_form` is the core of the form templates. It takes as input a declarative description of the attributes to show in the form, and returns a function `FormData<M> => C<FormData<M>>` which essentially goes from an instance of the model `M` to populate the initial form, to a component which will yield the new value(s) of `M`:

```
simple_inner_form = function<M>(mode:Mode, model_name:(_:M)=>string, attributes:FormEntry<M>[]) : (_:FormData<M>) => C<FormData<M>> {
```

The reason why we work with `FormData<M>` instead of directly with `M` is that `FormData` contains both an instance of the model and eventual validation errors:

```type FormData<M> = { model:M } & FormErrors```

The form entries declaratively represent individual elements of the form, described as a discriminated union. For each form entry, we specify the name of the attribute, the function to extract the value of the attribute from the model (`in:M=>string`), the function to merge the new value of the attribute with the model (`out:M=>string=>M`), and a validation function for this attribute:

```
type FormEntry<M> =
| { kind:"string", field_name:string, in:(_:M)=>string, out:(_:M)=>(_:string)=>M, get_errors:(_:M)=>Array<string> }
| { kind:"number", field_name:string, in:(_:M)=>number, out:(_:M)=>(_:number)=>M, get_errors:(_:M)=>Array<string> }
| { kind:"date", field_name:string, in:(_:M)=>Moment.Moment, out:(_:M)=>(_:Moment.Moment)=>M, get_errors:(_:M)=>Array<string> }
...
```

Some form entries are meant for an auto-saving form. For example, `lazy image` and `lazy file` will directly upload the new values the moment they are changed in the form, without passing them through to a save button:

```
type FormEntry<M> =
...
| { kind:"lazy image",  field_name:string, download:(c:M) => C<string>, upload:(c:M) => (src:string) => C<string> }
| { kind:"lazy file", field_name:string, filename:(_:M) => string, out:(_:M)=>(_:File)=>M, url:(_:M) => string, upload:(_:M) => (_:File) => C<void> }
```

Of course a form also needs to save data. After building the form with `simple_inner_form`, we could simply compose it with `then` to a button. The button acts as a filter which propagates the data it receives (of type `FormData<M>`) whenever it is clicked. The button is then further bound to a component responsible for saving. In pseudocode:

```
download.then(
simple_inner_form<M>.then(
button.map((fd:FormData<M>) => fd.model).then(
upload)))
```

This strategy is so recurrent that we have provided a template for it, called `simple_form_with_save_button`, which accepts not only the entries needed by the inner form, but also the download and upload components:

```
simple_form_with_save_button = function<M>(mode:Mode, model_name:(_:M)=>string, entries:FormEntry<M>[], download_M:C<M>, upload_M:(_:M)=>C<M>) : C<void>
```

Of course, the strategy above could also be implemented without adding a button, and immediately (actually we use a `delayer` to wait at least 200ms) upload the new data. In this case we obtain an auto-saving form. This alternate strategy is also quite common, therefore it is implemented as a template:

```
simple_form_with_autosave = function<M>(mode:Mode, model_name:(_:M)=>string, entries:FormEntry<M>[], download_M:C<M>, upload_M:(_:M)=>C<M>) : C<void>
```

#### Workflow template
Given various components, each associated with a name, it is possible to show them sequentially, connecting them via the well known "next"/"prev" buttons. This is precisely what the `simple_workflow` does. It takes as input a map of step names (of type `S`) and individual pages of the workflow (of type `WorkflowData<S,M> => C<WorkflowData<S,M>`), and manages the workflow:

```
simple_workflow = function<S,M>(workflow_name:string, steps:Immutable.Map<S, (_:WorkflowData<S,M>) => C<WorkflowData<S,M>>>, initial_model:C<M>, initial_step:S) : C<M>
```

The `WorkflowData` contains the current value of the model (of type `M`) being built by the workflow, and the current step (of type `S`):

```
type WorkflowData<S,M> = { model:M, step:S }
```

### Injecting custom react components
It might seem that the current library, despite its great expressive power, could be restrictive: since everything has to conform to interface `C<A>`, it might seem that the existing world of react components is cut out. Fortunately, this is not the case: it is possible to use external components with a very simple wrapping strategy, which is called `custom`. `custom` accepts as input a `render` function which will, in turn, accept as input the monadic react context and the continuation to invoke when the wrapped component is done. The result of `custom` is yet another `C<A>`, but the yielded values of type `A` are passed through from the custom component:

```
custom = function<A>(key?:string, dbg?:() => string) : (render:(ctxt:()=>Context) => (_:Cont<A>) => JSX.Element) => C<A> {
```

An example of this wrapping strategy involves defining one's (adapter) component which must accept context and continuation as properties:

```
type CounterProps = { ..., context:()=>Context, cont:Cont<number> }
type CounterState = { ... }
class Counter extends React.Component<CounterProps, CounterState> {
...
}
```

This component is then later on invoked by `custom`:

```
custom<number>()(ctxt => cont => <Counter target={n} context={ctxt} cont={cont} />).then(...)
```

### Advanced
The core of the application is meant to be stable and unchanging. This means that the basic behaviour of `unit`, `then`, `map`, etc. can simply be expected to remain the same.

Templates and combinators, on the other hand, should rather be seen as dynamic entities: depending on the domain, it is possible to build one's own templates and combinators in order to capture local structures of the application being built.

#### Building your own templates
_Note: the following contains a mix of TypeScript and pseudocode_

Building templates is perhaps the most commonly occurring scenario. Templates are reusable components which automate some recurring tasks. Templates are therefore used to capture domain-specific knowledge, and reduce code duplication.

Typical uses for templates are the definition of page structures, for example a page that is divided in four blocks would take as input four components, joining them together roughly as:

```
four_blocks : (b1:C<A>,b2:C<A>,b3:C<A>,b4:C<A>) => C<A>
```

The implementation of `four_blocks` would roughly just invoke the four blocks inside `any`. Whenever a block has an output, the output is just passed through as output of `four_blocks` itself:

```
let four_blocks = function<A>(b1:C<A>,b2:C<A>,b3:C<A>,b4:C<A>) : C<A> {
return any<void, A>()([
_ => b1, _ => b2, _ => b3, _ => b4
])(null)
}
```

Of course, the blocks could be less anonymous. For example, a page with a menu, a header, a footer, and a content could have a signature such as:

```
standard_layout : (menu:C<A>, content:(_:A) => C<B>, header:C<void>, footer:C<void>) => C<B>
```

The implementation of `standard_layout` thens the menu and the content together, whereas header and footer are just "silenced" by means of the `never` combinator:

```
let standard_layout = function<A,B>(menu:C<A>, content:(_:A) => C<B>, header:C<void>, footer:C<void>) : C<B> {
return any<void, B>()([
div<void, B>(`header_class_name` _ => header.never<B>())
div<void, B>(`menu_with_content_class_name`, _ => menu.then(`menu with content`, x => content(x)))
div<void, B>(`footer_class_name`, _ => footer.never<B>())
])(null)
}
```

#### Building your own combinators
_Note: the following contains a mix of TypeScript and pseudocode_

It is also possible to define one's combinators. This usually requires defining a supporting React component (a separate class). The typical workflow for defining a combinator `k` usually involves defining:
- the attributes needed by `k` (`KProps`);
- the output type of `k` (`B`);
- the React component class for `k` (`K`);
- the function to instantiate the class.

The general shape becomes therefore:

```
type KProps = { ...attributes needed by k... } & CmdCommon<B>
type KState = { ...state needed by k... }
class K extends React.Component<KProps, KState> {
...
}
let k = function(...attributes needed by k...) : C<B> {
return make_C<B>(ctxt => cont =>
React.createElement<KProps>(K,
{ ...attributes needed by k..., context:ctxt, cont:cont, key:key }))
}
```

The definition of class `K` should be quite careful when it comes to invoking `cont`. Too many accidental invocations can lead to loops, especially in the presence of `repeat` (very common when building forms). On the other hand, `K` is expected to invoke `cont` upon `componentWill/DidMount` and `componentWillReceiveProps`. `componentWillReceiveProps` should only (re)invoke `cont` if the output has changed though.

# Samples
To see the library in action in a simple application and to get inspiration on how to use it, you can jump to [the samples](../master/samples).


# About the authors
This library has mostly been set up by Dr. Giuseppe Maggiore, and is to some extent inspired from his PhD thesis on monadic coroutines for game development.

Giuseppe works as CTO for Hoppinger BV, a company focusing on web strategy, design, and development in Rotterdam (Netherlands). Hoppinger supports the development of the library with significant internal effort, and acts as beta user and corporate sponsor as part of its ongoing innovation strategy.

## Contact
<giuseppe@hoppinger.com> is the obvious place to start.

[The github repository](https://github.com/giuseppemag/MonadicReact) is also a great place to give feedback, and of course to participate!
