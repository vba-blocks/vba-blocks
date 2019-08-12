-- Arguments
--
-- appname (e.g. "excel")
-- addin: posix full path to addin (e.g. "...")
-- command: macro to execute in addin (e.g. "Build.ImportGraph")
-- ...args: arguments to pass to macro (up to 10)

on run argv
	set output to ""

	if (count of argv) >= 3 and (count of argv) <= 13 then
		set appname to (item 1 of argv)
		set addin to POSIX file (item 2 of argv)
		set command to (item 3 of argv)

		set args to {}
		repeat with index from 4 to count of argv
			set end of args to (item index of argv)
		end repeat

		if appname is "excel" then
			set workbook_name to name of (info for addin)

			tell application "Microsoft Excel"
				set workbook_was_open to (exists workbook workbook_name)
				if not workbook_was_open then
					open workbook workbook file name addin without notify
				end if

				set output to output & my run_excel_macro(command, args)

				if not workbook_was_open then
					close workbook workbook_name saving yes
				end if
			end tell
		end if
	else
		if (count of argv) < 3 then
			set output to output & "ERROR #1: Invalid Input (appname, file, and macro are required"
		else
			set output to output & "ERROR #2: Invalid Input (only 10 arguments are supported)"
		end if
	end if

	return output
end run

on run_excel_macro(command, args)
	set result to ""

	tell application "Microsoft Excel"
		if (count of args) = 0 then
			set result to result & (run VB macro command)
		else if (count of args) = 1 then
			set result to result & (run VB macro command arg1 (item 1 of args))
		else if (count of args) = 2 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args))
		else if (count of args) = 3 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args) arg3 (item 3 of args))
		else if (count of args) = 4 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args) arg3 (item 3 of args) arg4 (item 4 of args))
		else if (count of args) = 5 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args) arg3 (item 3 of args) arg4 (item 4 of args) arg5 (item 5 of args))
		else if (count of args) = 6 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args) arg3 (item 3 of args) arg4 (item 4 of args) arg5 (item 5 of args) arg6 (item 6 of args))
		else if (count of args) = 7 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args) arg3 (item 3 of args) arg4 (item 4 of args) arg5 (item 5 of args) arg6 (item 6 of args) arg7 (item 7 of args))
		else if (count of args) = 8 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args) arg3 (item 3 of args) arg4 (item 4 of args) arg5 (item 5 of args) arg6 (item 6 of args) arg7 (item 7 of args) arg8 (item 8 of args))
		else if (count of args) = 9 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args) arg3 (item 3 of args) arg4 (item 4 of args) arg5 (item 5 of args) arg6 (item 6 of args) arg7 (item 7 of args) arg8 (item 8 of args) arg9 (item 9 of args))
		else if (count of args) = 10 then
			set result to result & (run VB macro command arg1 (item 1 of args) arg2 (item 2 of args) arg3 (item 3 of args) arg4 (item 4 of args) arg5 (item 5 of args) arg6 (item 6 of args) arg7 (item 7 of args) arg8 (item 8 of args) arg9 (item 9 of args) arg10 (item 10 of args))
		end if
	end tell

	return result
end run_macro
