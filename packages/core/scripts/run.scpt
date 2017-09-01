on run argv
	set result to "(applescript)"

	set result to result & "\nRun: " & (item 1 of argv)

	set result to result & "\n" & (count of argv - 1) & " arguments"
	if ((count of argv) > 1) then
		repeat with i from 1 to (count of argv - 1)
	 		set result to result & "\n  Argument " & i & ": " & (item (i + 1) of argv)
		end repeat
	else
		set result to result
	end if

	return result
end run