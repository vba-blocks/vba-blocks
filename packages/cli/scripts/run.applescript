-- Arguments
--
-- appname (e.g. "excel")
-- addin: posix full path to addin (e.g. "...")
-- command: macro to execute in addin (e.g. "Build.ImportGraph")
-- args: JSON containing arguments to pass to macro

on run argv
	set output to ""

	if (count of argv) = 4 then
		set appname to item 1 of argv
		set addin to POSIX file item 2 of argv
		set command to item 3 of argv
		set args to item 4 of argv
		
		if appname is "excel" then
			-- TODO
			set workbook_name to "bootstrap.xlsm"

			tell application "Microsoft Excel"
				activate
				
				set was_open to (exists workbook workbook_name)
				if not was_open then
					open workbook workbook file name addin without notify
				end if
				
				set output to output & (run VB macro command arg1 args)
				
				if not was_open then
					close workbook workbook_name saving yes
				end if
			end tell
		end if
	else
		set result to result & "ERROR #1: Invalid Input"
	end if
	
	return output
end run