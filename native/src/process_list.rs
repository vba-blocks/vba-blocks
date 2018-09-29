use neon::prelude::*;
use sysinfo::{ProcessExt, System, SystemExt};

struct ProcessListTask;

    impl Task for ProcessListTask {
        type Output = Vec<String>;
        type Error = String;
        type JsEvent = JsArray;

        fn perform(&self) -> Result<Self::Output, Self::Error> {
            let mut system = System::new();
            system.refresh_processes();

            let mut values = Vec::new();
            for (_, process) in system.get_process_list() {
                values.push(process.name().to_string());
            }

            Ok(values)
        }

        fn complete(
            self,
            mut cx: TaskContext,
            result: Result<Self::Output, Self::Error>,
        ) -> JsResult<Self::JsEvent> {
            let names = result.or_else(|_| cx.throw_error("Failed to get process list"))?;

            let values = cx.empty_array();
            let mut index = 0;
            for (_, name) in names.iter().enumerate() {
                if name != "" {
                    let name_value = cx.string(name);
                    values.set(&mut cx, index as u32, name_value)?;

                    index += 1;
                }
            }

            Ok(values)
        }
}

pub fn get_processes(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let callback = cx.argument::<JsFunction>(0)?;
    ProcessListTask.schedule(callback);

    Ok(cx.undefined())
}
