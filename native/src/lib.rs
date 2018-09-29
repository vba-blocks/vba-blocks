#[macro_use]
extern crate neon;

#[cfg(windows)]
mod process_list;

#[cfg(not(windows))]
mod process_list {
    use neon::prelude::*;

    pub fn get_processes(mut cx: FunctionContext) -> JsResult<JsUndefined> {
        cx.throw_error("Not implemented on this platform")
    }
}

#[cfg(windows)]
mod registry;

#[cfg(not(windows))]
mod registry {
    use neon::prelude::*;

    pub fn add_to_open(mut cx: FunctionContext) -> JsResult<JsUndefined> {
        cx.throw_error("Not implemented on this platform")
    }

    pub fn remove_from_open(mut cx: FunctionContext) -> JsResult<JsUndefined> {
        cx.throw_error("Not implemented on this platform")
    }

    pub fn enable_vbom(mut cx: FunctionContext) -> JsResult<JsUndefined> {
        cx.throw_error("Not implemented on this platform")
    }

    pub fn add_to_path(mut cx: FunctionContext) -> JsResult<JsUndefined> {
        cx.throw_error("Not implemented on this platform")
    }

    pub fn remove_from_path(mut cx: FunctionContext) -> JsResult<JsUndefined> {
        cx.throw_error("Not implemented on this platform")
    }
}

register_module!(mut cx, {
    try!(cx.export_function("getProcesses", process_list::get_processes));

    try!(cx.export_function("addToOPEN", registry::add_to_open));
    try!(cx.export_function("removeFromOPEN", registry::remove_from_open));
    try!(cx.export_function("enableVBOM", registry::enable_vbom));
    try!(cx.export_function("addToPATH", registry::add_to_path));
    try!(cx.export_function("removeFromPATH", registry::remove_from_path));

    Ok(())
});
