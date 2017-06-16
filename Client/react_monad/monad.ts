import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Immutable from "immutable"

type CmdCommon<A> = { cont:Cont<A>, key:string }
export type Unit<A> = { kind:"unit", value:A } & CmdCommon<A>
export type Bind<A> = { kind:"bind", once:boolean, p:C<any>, k:(_:any) => C<A> } & CmdCommon<A>
export type String = { kind:"string", value:string } & CmdCommon<string>
export type Delay<A> = { kind:"delay", dt:number, value:A, p:(_:A)=>C<A> } & CmdCommon<A>
export type LiftPromise<A> = { kind:"lift promise", p:(_:any)=>Promise<A>, value:any } & CmdCommon<A>
export type Retract<A> = { kind:"retract", inb:(_:any)=>A, out:(_:any)=>(_:A)=>any, p:(_:any)=>C<any>, value:A } & CmdCommon<A>
export type Repeat<A> = { kind:"repeat", value:A, p:(_:A)=>C<A> } & CmdCommon<A>

export type Cmd<A> =
  Unit<A>
  | Bind<A>
  | String
  | Delay<A>
  | LiftPromise<A>
  | Retract<A>
  | Repeat<A>

export type Cont<A> = (callback:() => void) => (_:A) => void
export type C<A> = (cont:Cont<A>) => Cmd<A>

export let unit = function<A>(x:A) : C<A> { return cont => ({ kind:"unit", value:x, cont:cont, key:null }) }

export let bind = function<A,B>(key:string, p:C<A>, k:((_:A)=>C<B>)) : C<B> {
  return cont => ({ kind:"bind", p:p as C<any>, k:k as (_:any) => C<B>, once:false, cont:cont, key:key })
}

export let bind_once = function<A,B>(key:string, p:C<A>, k:((_:A)=>C<B>)) : C<B> {
  return cont => ({ kind:"bind", p:p as C<any>, k:k as (_:any) => C<B>, once:true, cont:cont, key:key })
}

export let lift_promise = function<A,B>(key:string, p:(_:A) => Promise<B>) : ((_:A)=>C<B>) {
  return x => cont => ({ kind:"lift promise", value:x, p:p as (_:any)=>Promise<B>, cont:cont, key:key })
}

export let retract = function<A,B>(key:string, inb:(_:A)=>B, out:(_:A)=>(_:B)=>A, p:(_:B)=>C<B>) : ((_:A) => C<A>) {
  return (initial_value:A) => (cont:Cont<A>) =>
    ({ kind:"retract", inb:inb as (_:A)=>any, out:out as (_:A)=>(_:any)=>A, p:p as (_:any)=>C<any>, value:initial_value, cont:cont, key:key })
}

export let repeat = function<A>(key:string, p:(_:A)=>C<A>) : ((_:A) => C<A>) {
  return initial_value => cont => ({ kind:"repeat", p:p as (_:A)=>C<A>, value:initial_value, cont:cont, key:key })
}

export let delay = <A>(key:string, dt:number) => (p:(_:A)=>C<A>) : ((_:A) => C<A>) => {
  return initial_value => cont => ({ kind:"delay", dt:dt, p:p as (_:A)=>C<A>, value:initial_value, cont:cont, key:key })
}

export let string = (key:string) => function(value:string) : C<string> {
  return cont => ({ kind:"string", value:value, cont:cont, key:key })
}