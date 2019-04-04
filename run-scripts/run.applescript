-- Arguments
--
-- appname (e.g. "excel")
-- addin: posix full path to addin (e.g. "...")
-- command: macro to execute in addin (e.g. "Build.ImportGraph")
-- arg: argument to pass to macro

on run argv
	set output to ""

	if (count of argv) = 4 then
		set appname to (item 1 of argv)
		set addin to POSIX file (item 2 of argv)
		set command to (item 3 of argv)
		set arg to (item 4 of argv)

		if appname is "excel" then
			set workbook_name to name of (info for addin)
			tell application "System Events" to set excel_was_open to (first process whose name is "Microsoft Excel")

			tell application "Microsoft Excel" to activate

			if not excel_was_open then
				tell application "System Events"
					set excel to (first process whose name is "Microsoft Excel")
					set visible of excel to false
				end tell
			end if

			tell application "Microsoft Excel"
				set workbook_was_open to (exists workbook workbook_name)
				if not workbook_was_open then
					open workbook workbook file name addin without notify
				end if

				set output to output & (run VB macro command arg1 arg)

				if not workbook_was_open then
					close workbook workbook_name saving yes
				end if
			end tell
		end if
	else
		set output to output & "ERROR #1: Invalid Input"
	end if

	return output
end run
