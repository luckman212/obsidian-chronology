import moment from "moment";
import * as React from "react";
import { useCallback } from "react";
import { TimeIndexContext } from "./CalendarView";


export enum CalendarItemType {
	Day,
	Week,
	Month,
	Year
}
export interface CalendarViewProps {
	current: CalendarItem;
	onChange: (sel: CalendarItem)=>void;
}

export type CalendarItem = {
	date: moment.Moment;
	type: CalendarItemType;
}


interface CalendarCellProps {
	value: CalendarItem;
	current: CalendarItem;
	onChange: (value: CalendarItem) => void
}

const Cell = ({ value,  current, onChange }: CalendarCellProps) => {

	const timeIndex = React.useContext(TimeIndexContext);

	const handleChange = useCallback(
		() => {
			onChange(value);
		},
		[value],
	)

	
	const itemDate = value.date;
	const currendDate = current.date;
	const month = currendDate.month();
	// let selected = false;

	if (value.type === CalendarItemType.Week) {
		const classes = ["chronology-calendar-weeknumber", "chronology-calendar-selectable"]

		if (current.type === CalendarItemType.Week && currendDate.week() === itemDate.week()) {
			classes.push("selected")
		}
		return <td key={`week-${value}`} className={classes.join(" ")} onClick={handleChange} >{itemDate.week()}</td>
	} else {
		const classes = ["chronology-calendar-day", "chronology-calendar-selectable"]
		classes.push(month === itemDate.month() ? "chronology-current-month" : "chronology-other-month");

		if (itemDate.isSame(moment(), "day")) classes.push("chronology-calendar-today");

		if (current.type === CalendarItemType.Day && itemDate.isSame(currendDate, "day")) {
			classes.push("selected")
		}

		const heatLevel = timeIndex.getHeatForDate(itemDate.format("YYYY-MM-DD"));
		const percentage = Math.max(0, Math.min(Math.ceil(heatLevel * 100), 100));
		const height = `${percentage}%`;

		return (
			<td key={itemDate.dayOfYear()} className={classes.join(" ")} onClick={handleChange}>
				<div className="chronology-calendar-heat-background" style={{ height }}></div>
				<span>{itemDate.date()}</span>

			</td>
		)
	}

}

const Week = ({ weekNumber, current, onChange }: {weekNumber: number, current: CalendarItem, onChange: (value: CalendarItem) => void}) => {

	const weekStart = moment().weekday(0).format("dddd");
	const firstDayOfWeek = moment().day(weekStart).week(weekNumber);
	const lastDayOfWeek = moment().day(weekStart).week(weekNumber).endOf("week");

	const weekRange: CalendarItem[] = [{
		date: firstDayOfWeek.clone(),
		type: CalendarItemType.Week
	}];
	for (let i = firstDayOfWeek.clone(); i.isBefore(lastDayOfWeek); i = i.add(1, "days")) {
		weekRange.push({
			date: i.clone(),
			type: CalendarItemType.Day
		});
	}


	return (
		<tr className="chronology-calendar-week-row">
			{weekRange.map(d => <Cell key={d.type.toString() + d.date.toString()} value={d} current={current} onChange={onChange} />

			)}
		</tr>
	)
} 
 


export const Calendar = ({ current, onChange }: CalendarViewProps) => {

	const currentDate = current.date;

	const weekStart = moment().weekday(0).format("dddd");
	const firstOfMonth = currentDate.clone().startOf("month");
	const endOfMonth = currentDate.clone().endOf("month");
	const monthName = currentDate.format("MMMM");
	const yearName = currentDate.format("YYYY");
	const startWeek = firstOfMonth.week();
	const endWeek = endOfMonth.week();
	const firstDayOGrid = moment().day(weekStart).week(startWeek);
	// const lastDayOfGrid = moment().day(weekStart).week(endWeek).endOf("week");

	const daysOfTheWeek = [""];
	const endofFirstFeek = firstDayOGrid.clone().endOf("week")
	for (let d = firstDayOGrid.clone(); d.isBefore(endofFirstFeek); d = d.add(1, "days")) {
		daysOfTheWeek.push(d.format("dd"));
	}

	const monthRange = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => i + startWeek);

	const handleChange = useCallback((value:CalendarItem)=>{
		onChange(value);
	},[onChange]);

	return (
		<div className="chronology-calendar-box">
			<table className="chronology-calendar-grid">

				<thead>
					<tr>
						<th colSpan={8}>
							<span className="chronology-calendar-selectable">
								{monthName}
							</span>
							<span className="chronology-calendar-selectable">
								{yearName}
							</span>
						</th>
					</tr>
					<tr>
						{daysOfTheWeek.map(dow => <th className="chronology-grid-dayofweek" key={dow} >{dow}</th>)}
					</tr>
				</thead>
				<tbody>
					{monthRange.map(week => <Week key={week} weekNumber={week} current={current}  onChange={handleChange} />)}
				</tbody>
			</table>


		</div>
	)
}
