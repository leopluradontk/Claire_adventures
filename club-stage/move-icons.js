const draw={
 spin:'<path d="M47 20A20 20 0 1 0 51 39M47 20V7m0 13H34"/>',
 jump:'<path d="M13 49Q30 19 47 49M30 40V9m-10 10L30 9l10 10"/>',
 wave:'<path d="M19 45V25q0-9 6-2V11q3-7 6 0v12V7q4-6 7 1v18-11q4-6 7 1v18l6-7q9-2 3 9L42 54H26Z"/>',
 wiggle:'<path d="M9 18q11-16 22 0t22 0M9 32q11-16 22 0t22 0M9 46q11-16 22 0t22 0"/>',
 clap:'<path d="m13 51-6-21q3-6 7 3l-1-18q3-7 6 0l4 17-1-21q5-6 8 0l1 22 5 12m12 6 6-21q-3-6-7 3l1-18q-3-7-6 0l-4 17 1-21q-5-6-8 0l-1 22-5 12"/>',
 pose:'<path d="m30 5 8 17 19 3-14 13 3 20-16-10-17 10 4-20L3 25l19-3Z"/>'
};
export function moveIcon(move){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 62" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'+(draw[move]||draw.pose)+'</g></svg>';}
