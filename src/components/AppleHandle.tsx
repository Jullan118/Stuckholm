import * as React from "react";

// Line-drawing apple used as the drag handle on the Trash gender slider.
// Strokes stay a fixed thin width on screen however big the handle is drawn.
export function AppleHandle({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 207.32 293.51"
      className={className}
      style={style}
      fill="none"
      stroke="black"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path vectorEffect="non-scaling-stroke" d="M95.07,100.82c-1.33-3.29-4.52-3.54-7.15-3.46-6.99.23-13.63,2.56-19.81,5.57-6.82,3.32-13.52,7.03-19.54,11.79-8.07,6.39-14.83,13.92-20.23,22.68-.76,1.24-1.32,2.59-2.81,3.21.29-.97-.74-1.9.01-2.82" />
      <path vectorEffect="non-scaling-stroke" d="M173.34,189.84c1.2.05,2.44-.2,3.64.41.66,1.21.7,2.67,1.02,3.98.43,1.76.02,3.51-1.86,4.78-6.93,4.7-13.33,10.18-20.69,14.27" />
      <path vectorEffect="non-scaling-stroke" d="M129.24,240.71c-3.31,3.39-3.87,8.49-7.85,11.64-3.44,2.71-7.02,4.16-11.22,4.2-2.08.02-3.83.49-5.58,1.61-3.51,2.23-7.21,2.96-11.12.85-.61-.33-1.49-.97-1.94-.76-3.97,1.85-8.34.29-12.34,1.54-2.33.73-2.75,2.66-1.2,5.16" />
      <path vectorEffect="non-scaling-stroke" d="M106.6,88.9c.25,2.96,3,4.71,3.65,7.53.17.72,1.39.78,2.3.84,10.03.57,19.04,4.14,27.41,9.52,6.48,4.16,13.41,7.69,18.67,13.52,3.9,4.32,7.61,8.83,11.28,13.31,1.26,1.53,2.09,4.19,3.44,6.15,1.03,1.49,1.97,3.48,4.35,1.98,1.69-1.06,2.44-4.74,1.17-6.32-2.2-2.75-4.99-3.63-8.31-2.01" />
      <path vectorEffect="non-scaling-stroke" d="M33.1,144.54c-.46-.49-.93-.97-1.72-1.23-2.52,4.16-5.14,8.32-4.59,13.54.12,1.18-.67,1.49-1.25,1.97-2.16,1.78-1.86,4.52-2.71,6.8-.7,1.89,1.31,2.51,2.37,3.09,6.34,3.49,13.26,5.54,20.24,7.16,14.49,3.36,29.34,3.85,44.09,5.22,1.48.14,2.99-.21,4.34-.52,1.91-.43,3.6-.67,5.61-.42,2.06.27,3.66-1.32,4.35-3.44" />
      <path vectorEffect="non-scaling-stroke" d="M21.97,198.59c3.19.26,6.45,2.06,9.66-.42,2.16,2.77,4.91,4.11,8.58,4.97,11.94,2.79,23.99,4.39,36.18,5.53,5.97.56,11.93.79,17.89.98,1.92.06,4.28-.17,4.37-3.11" />
      <path vectorEffect="non-scaling-stroke" d="M176.52,142.95c-.6,2.23.08,4.37.85,6.34,2.24,5.72,3.72,11.67,5.7,17.44,1.39,4.07,1.14,7.98,1.39,11.99.07,1.2-.19,2.44.4,3.58" />
      <path vectorEffect="non-scaling-stroke" d="M149.11,139.77c-2.33-4.13.77-7.26,1.55-11.73-1.42-3.96-4.63-6.97-9.74-9.26-3.98-1.79-8.12-4.25-11.68-7.21-4.16-3.46-9.24-5.36-13.95-7.85-1.77-.94-3.82,1.19-5.9,1.09" />
      <path vectorEffect="non-scaling-stroke" d="M64.48,185.08c-2.12.94-4.12.95-6.38.07-3.52-1.38-6.75-4.43-11.2-1.83-1.05.61-3.34-1.35-5.06.17" />
      <path vectorEffect="non-scaling-stroke" d="M23.56,142.55c.85.82.66,2.12.33,2.74-3.93,7.35-5.01,15.81-9.07,23.09" />
      <path vectorEffect="non-scaling-stroke" d="M95.47,186.27c-3.9,1.39-6.91,3.78-7.91,7.96-.79,3.3.96,6.38,3.9,8.38,1.79,1.22,4.08,1.46,5.64,3.08.14.15.64.45,1.14.48,2.03.11,9.43-4.02,10.31-6.01,1.54-3.5,1.71-6.84-1.15-9.95-3.18-3.45-7.09-4.41-11.54-3.95" />
      <path vectorEffect="non-scaling-stroke" d="M143.15,222.43c-3.3-3.58-7.19-4.69-11.93-3.23-2.7.83-5.52.6-8.34.1-1.66-.29-3.69-.23-1.58,2.33" />
      <path vectorEffect="non-scaling-stroke" d="M151.49,129.04c1.54.79,3.07,1.5,4.73,2.09,6.58,2.35,7.67,2.82,6.17,9.79-.55,2.58.22,2.88,1.82,3.19,7.42,1.43,11.08,9.71,5.56,16.73" />
      <path vectorEffect="non-scaling-stroke" d="M122.43,40.76c8.59,3.28,4.57-.46,5.84-.65,2.27-.35-2.29-.98-1.85-2.42.71-2.33-1.31,1.26-3.38.84-1.65-.34.81-7.82,1.07-3.73.04.69,3.11-2.71,1.44-2.51-3.66.44-6.12.26-6.27,2.29-.13,1.72-4.94,1.48-6.32,1.47-2.65-.02-5.3,0-8.19,0-.88,2.15.49,4.6-.55,6.76" />
      <path vectorEffect="non-scaling-stroke" d="M157.45,236.74c1.17-.17,2.09.25,2.95,1.45-5.17,4.64-9.88,9.92-16.46,12.84-.73.32-1.51.55-1.97,1.22-2.23,3.33-4.99,2.94-7.96,1.19" />
      <path vectorEffect="non-scaling-stroke" d="M101.83,175.14c1.08-.18,1.44,1.1,2.36,1.23,2.5-3.43,2.29-7.7-.8-9.92-3.02-2.16-7.25-2.07-9.53.72-2.24,2.75-3.77,6.09-.37,9.56.66.67,1.32,1.33,1.99,1.99" />
      <path vectorEffect="non-scaling-stroke" d="M32.3,229.19c4.87,7.27,10.67,13.66,17.89,18.66,1.75,1.21,3.28,2.87,5.61,3.15.33-.56.84-1.13.73-1.94" />
      <path vectorEffect="non-scaling-stroke" d="M75.01,256.61c-.32.88-.55,1.64-1.29,2.48-2.53,2.87-1.39,6.75,2.29,8.23,6.48,2.59,13.24,3.63,20.25,3.69,5.44.04,11.03.3,16.24,1.7,3.94,1.06,5.82-.63,8.01-2.96,1.98-2.11,3.98-3.73,6.78-.85,1.98,2.04,5.05,2,7.55,3.13,1.1.5,1.71.8,2,2.06.65,2.89-2.7,8.77-5.62,9.11-5.91.7-11.49,2.54-17.08,4.42-1.31.44-2.68,1.13-2.78-1.2" />
      <path vectorEffect="non-scaling-stroke" d="M145.53,183.09c2.88-.08,5.6,1.59,8.52.64.63,2.56-.16,4.92-.22,7.31-.05,1.78.25,3.21,2.03,3.97,1.02.44,8.06-.59,9.15-1.17,2.51-1.34,5.15-2.42,7.54-3.99" />
      <path vectorEffect="non-scaling-stroke" d="M50.98,193.42c1.36-1.15,2.91-2.33,1.56-4.35-.91-1.36-2.24-.8-3.55-.46-1.49.39-1.15,1.45-1.18,2.42-.05,1.9.88,2.82,2.78,2.78" />
      <path vectorEffect="non-scaling-stroke" d="M182.48,166.4c-5.47,1.02-10.22-1.34-15.1-3.16-1.03-.38-1.48-1.29-1.94-2.03-3.21-5.29-6.29-10.65-2.82-17.06" />
      <path vectorEffect="non-scaling-stroke" d="M18.4,183.88c-2.49,4.03-2.84,7.96.81,11.51,3.23,3.14,1.61,7.52,3.07,11.18,2.79,7.02,3.67,14.79,8.44,21.02" />
      <path vectorEffect="non-scaling-stroke" d="M177.71,199.78c3,3.06.29,6.18-.58,8.68-3.75,10.77-8.84,20.92-16.9,29.27" />
      <path vectorEffect="non-scaling-stroke" d="M74.02,267.34c-1.71,2.21-4.34,2.69-6.75,3.59-2.55.95-4.7,1.52-5.89,5.05-1.19,3.54-.05,4.45,2.31,5.67,6.73,3.48,13.97,4.74,21.43,5.7,8.66,1.12,17.22.67,25.84.27" />
      <path vectorEffect="non-scaling-stroke" d="M163.81,225.21c-2.04,2.3-4.39,3.22-7.57,2.48-1.72-.4-3.3-1.43-5.14-1.29" />
      <path vectorEffect="non-scaling-stroke" d="M116.13,75.98c-1.15,3.3-4.03,5.46-5.62,8.51-1.76,3.39-5.36,4.01-8.69,4.3-2.34.2-4.69,1.95-7.19.17-.63-.45-5.53,4.04-5.46,5.1.07,1.08-.63,1.95-.46,2.98" />
      <path vectorEffect="non-scaling-stroke" d="M177.31,190.24c.4-.26,1.07-.69,1.12-.82,1.87-4.75,5.22-6.94,10.4-7.27,2.68-.17,4.06-4.19,3.56-8.6-.32-2.8-1.73-4.87-4.75-5.11-1.21-.1-2.35-.54-3.57-.46" />
      <path vectorEffect="non-scaling-stroke" d="M125.27,249.06c4.22,2.82,8.58,3.21,13.11.79" />
      <path vectorEffect="non-scaling-stroke" d="M29.13,133.81c-2.84-2.29-6.28-2.12-8.34.4-1.53,1.87-1.14,5.22.79,7.16,1.4,1.41,2.52.87,3.58-.4" />
      <path vectorEffect="non-scaling-stroke" d="M102.23,100.03c1.67-.4,2.82,1.04,4.36,1.25,1.6.22,2.37,2.05,1.89,3.07-1.45,3.04-1.48,6.88-5.03,8.84-3.12,1.72-5.77.89-8.8-.35-4.75-1.94-3.19-5.85-3.54-9.23" />
      <path vectorEffect="non-scaling-stroke" d="M97.86,42.4c.19-1.98.61-3.95.3-6.36-3.47.01-8.17-.42-11.82-.4-4.57,0-6.56-1.77-10.08-1.34-2.66.33-.1,2.15,3.01,2.93,2.15-2.77,1.67,4.65-3.58.98-4.12,2.82-.75,1.4.99,3" />
      <path vectorEffect="non-scaling-stroke" d="M166.98,163.61c-4.64,6.68-10.59,11.21-19.07,11.53" />
      <path vectorEffect="non-scaling-stroke" d="M134.41,189.84c-4.28.99-5.1,1.89-4.37,4.77.79,3.13,3.14,3.99,5.55,1.97.94-.78,1.39-2.02,2.4-2.77-.71-1.37-1.25-2.86-2.78-3.58" />
      <path vectorEffect="non-scaling-stroke" d="M62.1,276.08c3.92.54,7.21,2.89,11.1,3.68,3.7.75,7.29,2.02,11.15,1.88" />
      <path vectorEffect="non-scaling-stroke" d="M74.02,186.66c-2,1.14-3.48-.38-5.17-.97-2.23-.78-4.11-2.67-6.75-2.21" />
      <path vectorEffect="non-scaling-stroke" d="M103.82,19.89c-.04-3.6,3.14-4.12,0-6.08-1.53,1.59-4.23,2.84-5.85,5.53-2.5.38-4.36-7.69-3.92-4.11.29,2.37.91,10.96,3.01,10.09" />
      <path vectorEffect="non-scaling-stroke" d="M35.48,178.72c4.55,2.68,7.65,6.09,6.37,11.93-1.04,4.72-1.86,5.27-5.97,5.2-.91-.02-1.96-.49-2.78.36" />
      <path vectorEffect="non-scaling-stroke" d="M87.13,76.98c-2.26,1.26-1.24,3.13-.76,4.76,1.06,3.64,4.46,5.06,7.12,7.16" />
      <path vectorEffect="non-scaling-stroke" d="M103.42,43.6c-2.05-.84-4-1.67-6.37-.85-3.19,1.1-6.66-.07-9.91.85" />
      <path vectorEffect="non-scaling-stroke" d="M134.8,279.66c-3.29-.56-6.5-1.73-9.93-1.2-3.73.56-4.56-3.09-6.75-4.76" />
      <path vectorEffect="non-scaling-stroke" d="M163.81,160.04c-4,1.24-8.64.55-11.92,3.97" />
      <path vectorEffect="non-scaling-stroke" d="M15.22,169.58c5.87,3.28,7.31,7.87,4.33,14-3.17-.23-6.02-1.84-9.52-1.51-3.08.29-5.27-4.81-4.35-8.51,1.02-4.08,4.2-6.3,7.95-5.57.92.18,1.27.71,1.19,1.6" />
      <path vectorEffect="non-scaling-stroke" d="M105.8,61.88c-1.85,1.51-3.8-.12-5.55-.24-8.54-.57-15.71,6.83-14.12,15.34" />
      <path vectorEffect="non-scaling-stroke" d="M146.72,176.33c-.53.93-1.55,1.49-2.39,1.53-12.98.7-25.83,3.47-38.94,2.62-1.04-.07-1.8-.77-2.77-.58" />
      <path vectorEffect="non-scaling-stroke" d="M132.42,213.69c-1.8-1.41-3.8-2.37-5.92-3.28-2.62-1.13-5-1.52-7.59-.3" />
      <path vectorEffect="non-scaling-stroke" d="M111.76,257.01c-.44,3.17,1.09,6.59-1.19,9.54" />
      <path vectorEffect="non-scaling-stroke" d="M77.99,191.43c-3.58,1.24-4.25,2.98-1.99,5.17,1.36,1.32,1.73,1.19,4.37-1.59.27-1.71-1.66-2.2-1.98-3.58" />
      <path vectorEffect="non-scaling-stroke" d="M123.12,40.99c.05,2.47-.67,5.18,1.19,3.07,1.57-1.79.88-.64,3.38,1.11" />
      <path vectorEffect="non-scaling-stroke" d="M114.14,266.94c-1.54,1.86-3.67.97-5.68,1.24-.67,1.07-.11,2.34-.28,3.53" />
      <path vectorEffect="non-scaling-stroke" d="M153.08,192.23c-1.44.24-2.83.03-3.14-1.6-.52-2.76-2.52-2.39-4.41-2.38" />
      <path vectorEffect="non-scaling-stroke" d="M105.4,258.2c0,2.25.06,4.51-.03,6.76-.04.99.25,1.49,1.22,1.59" />
      <path vectorEffect="non-scaling-stroke" d="M101.83,103.61c0-1.34,0-2.68,0-4.02-1.59.17-2.82-.2-3.98.43-7.43,4.05-16.04,3.8-23.78,6.51-4.41,1.54-8.61,3.9-12.79,6.16-8.05,4.35-14.41,10.64-20.63,17.15" />
      <path vectorEffect="non-scaling-stroke" d="M154.67,195.81c-1.04.72-1.4,1.99-2.36,2.81-.65.55-1.88.36-1.68,1.52-1.83.24-2.82-1.27-4.3-1.15" />
      <path vectorEffect="non-scaling-stroke" d="M110.17,282.04c-5.12,1.12-10.32.91-15.49.71-1.57-.06-3.18-.22-4.77-.31" />
      <path vectorEffect="non-scaling-stroke" d="M161.02,152.49c-1.32,0-2.65-.03-3.97,0-2.85.09-6.02,2.92-5.44,5.53.67,3.02.26,4.03-2.92,3.27-.45-.11-.74,1.14-1.57,1.13" />
      <path vectorEffect="non-scaling-stroke" d="M108.19,257.01v8.74" />
      <path vectorEffect="non-scaling-stroke" d="M145.93,149.31c.1-1.09-1.61-2.04-.37-3.15.94-.84,2.06-.67,3.16-.04,3.69,2.09,7.88,2.35,11.91,3.19" />
      <path vectorEffect="non-scaling-stroke" d="M123.68,258.6c1.93,2.66,2.68,5.53,1.59,8.74" />
      <path vectorEffect="non-scaling-stroke" d="M145.93,233.56c1.61,2.79.44,5.84.79,8.74" />
      <path vectorEffect="non-scaling-stroke" d="M159.04,177.92c2.75.91,5.95.22,8.34,2.38" />
      <path vectorEffect="non-scaling-stroke" d="M140.37,119.5c-1.23,1.78-1.03,3.69-.37,5.56.55,1.55.75,2.92-.82,3.98" />
      <path vectorEffect="non-scaling-stroke" d="M120.1,191.43c-.95.64-1.86,1.01-2.54,2.3-.98,1.83-.66,2.93.58,4.03,1.41,1.26,2.68.05,3.46-.85.43-.5,1.39-.94,1.3-1.85-.51-1.34-1.43-2.3-2.4-3.23" />
      <path vectorEffect="non-scaling-stroke" d="M126.06,231.97c-2.62-1.4-5.46-1.59-8.34-1.59" />
      <path vectorEffect="non-scaling-stroke" d="M129.24,185.47c-3.29,2.27-7.01,2.27-10.14-.16-1.89,1.86-4.05,3.34-6.95,2.15" />
      <path vectorEffect="non-scaling-stroke" d="M182.48,169.58c-2.93,3.06-4.98,6.79-9.46,8.54-4.02,1.57-4.43,4.19-1.99,7.7,2.16,3.1,2.05,6.01.72,9.19" />
      <path vectorEffect="non-scaling-stroke" d="M145.13,189.05c-1.78,4.25-1.48,4.76,3.18,5.56" />
      <path vectorEffect="non-scaling-stroke" d="M163.01,223.23c-2.65-.54-5.39-.62-7.95-1.59" />
      <path vectorEffect="non-scaling-stroke" d="M143.54,184.28c-1.9,1.57-4.17,1.18-6.36,1.18-.97,0-1.39-.59-1.19-1.57" />
      <path vectorEffect="non-scaling-stroke" d="M107.64,21.78c1.85.54-2.38-3.14.16-4.19,1.73-.71,2.8-3.31,2.29-2.13-.59,1.36-.94,11.04-2.61,9.91-1.91-1.29-6.33-1.51-8.43-.86" />
      <path vectorEffect="non-scaling-stroke" d="M163.41,195.41c-.2,2.67,1.31,4.98,1.59,7.55" />
      <path vectorEffect="non-scaling-stroke" d="M37.07,188.65c-.08,2.61-2.77,3.91-3.18,6.36" />
      <path vectorEffect="non-scaling-stroke" d="M95.47,61.48c-1.7-4.73-.94-5.91,3.97-5.93,1.1,0,2.05-.52,3.18-.46,5.05.25,5.86,1.54,3.41,6.31,5.21,2.6,7.15,7.28,7.8,12.79.07.56.74,1.52,1.5,2" />
      <path vectorEffect="non-scaling-stroke" d="M77.2,202.56c-6.91.04-13.57-4.32-20.66-1.21-.47.21-.02.22-.37-.02-4.69-3.25-11.57-.77-15.52-5.93" />
      <path vectorEffect="non-scaling-stroke" d="M136.39,204.15c-.75.82-1.84,1-2.79,1.15-4.75.72-4.76.67-4.76,5.61" />
      <path vectorEffect="non-scaling-stroke" d="M168.97,181.1c-2.99-.59-5.24,2.24-8.37,1.82-.65-.09-2.3,2.53-1.96,4.54" />
      <path vectorEffect="non-scaling-stroke" d="M105.4,248.26c.2,2.26-.57,4.63.79,6.76" />
      <path vectorEffect="non-scaling-stroke" d="M131.23,225.61c-2.17.13-4.07-1.9-6.36-.79" />
      <path vectorEffect="non-scaling-stroke" d="M110.57,210.11q-.05,3.78-3.18,2.38" />
      <path vectorEffect="non-scaling-stroke" d="M101.03,260.19v6.36" />
      <path vectorEffect="non-scaling-stroke" d="M34.89,177.13c.69,1.17-.07,1.82-1,1.94-2.04.28-2.76,2.12-4.09,3.05-3.28,2.31-.7,6.12-2.86,8.68-.42.5,2.09,2.83,3.77,3.81" />
      <path vectorEffect="non-scaling-stroke" d="M77.2,275.29c-1.7,1.22-4.71.55-5.16,3.58" />
      <path vectorEffect="non-scaling-stroke" d="M130.83,204.55c-.67-2.52-4.58-4.13-7.12-2.73-1.17.65-2.29,1.18-3.56,1.66-3.6,1.36-1.22,4.31-1.24,6.63" />
      <path vectorEffect="non-scaling-stroke" d="M97.06,90.49c-1.1,1.99.45,3.97,0,5.74.76,1.96,4.29-.27,3.97,3.01" />
      <path vectorEffect="non-scaling-stroke" d="M143.94,200.57q-4.77-.75-7.5,1.16c-.65,4.2,3.24,1.29,4.32,2.82" />
      <path vectorEffect="non-scaling-stroke" d="M87.53,202.56c-3.16.47-6.27,2.45-9.53.4" />
      <path vectorEffect="non-scaling-stroke" d="M106.2,192.23c-3.16,1.1-.54,3.86-1.59,5.56" />
      <path vectorEffect="non-scaling-stroke" d="M56.14,251.44c3.96,3.56,8.8,5.18,13.92,5.86,1.4.19,2.31,1.07,3.56,1.29" />
      <path vectorEffect="non-scaling-stroke" d="M102.62,89.3c.16,1.87-.53,3.86.79,5.56" />
      <path vectorEffect="non-scaling-stroke" d="M83.55,186.66c-.25-2.05-.3-4.24-3.18-4.37" />
      <path vectorEffect="non-scaling-stroke" d="M121.3,279.66c-.09.62-.49,1.56-.78,1.52-2.49-.37-4.74.94-7.16.87" />
      <path vectorEffect="non-scaling-stroke" d="M106.6,107.58c-1.94.02-3.6-1.29-5.56-1.19" />
      <path vectorEffect="non-scaling-stroke" d="M141.56,173.55c1.03.36,1.88,1.46,3.2.43.92-.71,1.71.05,2.36.76" />
      <path vectorEffect="non-scaling-stroke" d="M115.73,221.64c-1.37.64-2.69,1.34-1.58,3.17,1.19,1.97-.19,4.47,1.5,6.43.53.62-.77,1.2-1.51,1.52" />
      <path vectorEffect="non-scaling-stroke" d="M105.8,74.99c.95-2.25,2.93-1.09,4.37-1.08,1,0,2.04.79,3.18.28" />
      <path vectorEffect="non-scaling-stroke" d="M110.17,110.36q1.22,3.18,3.58,1.99" />
      <path vectorEffect="non-scaling-stroke" d="M98.65,22.53c-2.19,4.21-.57,8.76-1.19,13.11" />
      <path vectorEffect="non-scaling-stroke" d="M95.47,78.97c4.64-1.2,9.22-1.68,13.51,1.19" />
      <path vectorEffect="non-scaling-stroke" d="M148.71,169.58c1,1.61.79,3.4.79,5.17" />
      <path vectorEffect="non-scaling-stroke" d="M80.38,269.33c-.74,1.49.15,3.86-2.38,4.37" />
      <path vectorEffect="non-scaling-stroke" d="M149.11,200.97c-.57,2.62-2.66,1.88-4.37,1.99" />
      <path vectorEffect="non-scaling-stroke" d="M136,201.37c-1.72-1.44-3.27-.78-4.77.4" />
      <path vectorEffect="non-scaling-stroke" d="M119.31,210.51c-1.35,1.16.93,3.64-1.59,4.37" />
      <path vectorEffect="non-scaling-stroke" d="M139.57,241.91c1.59,1.37.47,3.19.79,4.77" />
      <path vectorEffect="non-scaling-stroke" d="M83.55,253.83c-.72,1.54-.27,3.18-.4,4.77" />
      <path vectorEffect="non-scaling-stroke" d="M86.73,73.8c2.39-.04,4.75.67,7.15.4" />
      <path vectorEffect="non-scaling-stroke" d="M103.82,253.43c-1.4-.81-2.92-.21-4.37-.4" />
      <path vectorEffect="non-scaling-stroke" d="M81.17,190.24c-.47-2.51.06-3.44,2.37-3.09,1.9.28,4.1.17,5.57,1.9" />
      <path vectorEffect="non-scaling-stroke" d="M85.14,248.26c.65.94-1.63,3.96,1.99,2.78.23.81.57,1.58.79,2.38" />
      <path vectorEffect="non-scaling-stroke" d="M106.99,237.14c.27.35-.31.77.34,1.27.81.62,3.12-.52,2.44,1.91-.16.58.45,1.65-.79,1.56-1.26-.09-3.06,1.26-3.58-1.16" />
      <path vectorEffect="non-scaling-stroke" d="M174.53,214.09c-1.59-1.29-2.85.94-4.37.4" />
      <path vectorEffect="non-scaling-stroke" d="M69.65,202.16c.36,3.56-2.16,3.16-4.37,3.18" />
      <path vectorEffect="non-scaling-stroke" d="M95.87,199.38c-1.98.61-1.83,2.51-2.38,3.97" />
      <path vectorEffect="non-scaling-stroke" d="M36.67,137.78c-.62-.08-.52-1.59-1.59-.8-2.15,1.58-2.33,4.13-3.18,6.36" />
      <path vectorEffect="non-scaling-stroke" d="M27.54,173.95c-.4.4-.79.79-1.39,1.39,1.65,1.39,3.69,2.12,5.36,3.38" />
      <path vectorEffect="non-scaling-stroke" d="M76.4,252.64c.75-.17,1.31.07,1.58.8.42,1.12-.76,1.08-1.19,1.59" />
      <path vectorEffect="non-scaling-stroke" d="M52.57,242.7c.52,1.27,2.13,1.94,1.99,3.58-.73.87-2.51-.09-2.78,1.59" />
      <path vectorEffect="non-scaling-stroke" d="M149.11,237.93c1.44,1.19.72,2.6.4,3.97" />
      <path vectorEffect="non-scaling-stroke" d="M122.88,211.7c-1.68,1.15-.95,3.71-2.78,4.77" />
      <path vectorEffect="non-scaling-stroke" d="M99.44,208.13c3.96,2.73,8.42,1.66,12.71,1.53,2-.06,3.97-.73,5.96.06" />
      <path vectorEffect="non-scaling-stroke" d="M29.92,208.13c-2.22.2-3.84,1.91-5.96,2.38" />
      <path vectorEffect="non-scaling-stroke" d="M26.74,205.74c-1.28-.49-2.38-1.89-3.97-.79" />
      <path vectorEffect="non-scaling-stroke" d="M105.4,26.11c-.87,3.01-.18,6.1-.4,9.14" />
      <path vectorEffect="non-scaling-stroke" d="M106.99,95.26c-1.25.22-2.16,1.46-3.58,1.19" />
      <path vectorEffect="non-scaling-stroke" d="M121.3,271.71c1.41.27,1.78,2.42,3.58,1.99" />
      <path vectorEffect="non-scaling-stroke" d="M63.69,111.95c.62,1.11.95,2.29.79,3.58" />
      <path vectorEffect="non-scaling-stroke" d="M96.66,249.46c.95,1.08,2.69.36,3.58,1.59" />
      <path vectorEffect="non-scaling-stroke" d="M118.51,236.34q-2.17,1.5,1.19,4.37" />
      <path vectorEffect="non-scaling-stroke" d="M114.14,210.11c-.03,1.85-1,3.32-1.99,4.77" />
      <path vectorEffect="non-scaling-stroke" d="M40.65,133.41c-2.7-.61-3.92,1-4.77,3.18" />
      <path vectorEffect="non-scaling-stroke" d="M158.24,180.7c-1.02-.57-.29-2.89-2.38-2.38" />
      <path vectorEffect="non-scaling-stroke" d="M157.45,167.59c-2.12-2.36-5.18-1.84-6.58-.24-1.89,2.15-3.56.91-5.34,1.04" />
      <path vectorEffect="non-scaling-stroke" d="M23.96,164.01c1.06.13,2.12-.02,3.18,0" />
      <path vectorEffect="non-scaling-stroke" d="M97.46,43.2c0,3.84,0,7.68,0,11.53" />
      <path vectorEffect="non-scaling-stroke" d="M101.03,175.54c-.97.84-2.13.18-3.18.4" />
      <path vectorEffect="non-scaling-stroke" d="M85.14,35.25c.51-.21.68.61,1.19.4-.39,1.75,1,3.8-.79,5.56" />
      <path vectorEffect="non-scaling-stroke" d="M33.5,140.56c1.13.17,2.39.12,2.78,1.59" />
      <path vectorEffect="non-scaling-stroke" d="M159.44,188.25c-1.61.54-1.56,1.56-.79,2.78" />
      <path vectorEffect="non-scaling-stroke" d="M95.87,93.27c-1.03.52-1.14,2.33-2.78,1.99" />
      <path vectorEffect="non-scaling-stroke" d="M35.08,202.16v3.18" />
      <path vectorEffect="non-scaling-stroke" d="M37.87,203.36c-.02,1.11,0,2.2,1.19,2.78" />
      <path vectorEffect="non-scaling-stroke" d="M44.22,127.05c1.02.82,1.16,2.07,1.59,3.18" />
      <path vectorEffect="non-scaling-stroke" d="M85.14,104.8c.96,1.28.76,2.22-.79,2.78" />
      <path vectorEffect="non-scaling-stroke" d="M135.2,123.08c-.84.99-1.96,1.22-3.18,1.19" />
      <path vectorEffect="non-scaling-stroke" d="M108.98,244.69c-.97.62-2.03.88-3.18.79" />
      <path vectorEffect="non-scaling-stroke" d="M71.24,270.12c.13,1.04,1.7,1.46,1.19,2.78" />
      <path vectorEffect="non-scaling-stroke" d="M128.45,115.13c-1.65,1.05-3.35,1.53-5.16.4" />
      <path vectorEffect="non-scaling-stroke" d="M80.38,284.03c1.8.79.32,1.59,0,2.38" />
      <path vectorEffect="non-scaling-stroke" d="M109.38,243.5c-.31,3.1,2.73,2.02,3.97,3.18" />
      <path vectorEffect="non-scaling-stroke" d="M112.16,243.1c.85.82.19,1.87.4,2.78" />
      <path vectorEffect="non-scaling-stroke" d="M125.27,116.72c-1.71,1.92.36,3.21.79,4.77" />
      <path vectorEffect="non-scaling-stroke" d="M80.38,105.59c-.07,1.48.87,2.86.4,4.37" />
      <path vectorEffect="non-scaling-stroke" d="M32.7,224.42c-.91.34-1.67,1.19-2.78.79" />
      <path vectorEffect="non-scaling-stroke" d="M31.91,222.04c-.98.08-2.11-.38-2.78.79" />
      <path vectorEffect="non-scaling-stroke" d="M85.14,209.72v2.78" />
      <path vectorEffect="non-scaling-stroke" d="M91.9,206.14c-.67,1.18-1.8.71-2.78.79" />
      <path vectorEffect="non-scaling-stroke" d="M90.7,83.73c.56.87.35,1.84.4,2.78" />
      <path vectorEffect="non-scaling-stroke" d="M86.33,40.81h2.78" />
      <path vectorEffect="non-scaling-stroke" d="M139.17,181.5c-1.04.33-2.12.59-2.78,1.59" />
      <path vectorEffect="non-scaling-stroke" d="M160.23,179.51c-1.48,1.64-3.84,2.13-5.16,3.97" />
      <path vectorEffect="non-scaling-stroke" d="M127.69,45.17c-4.66.77-16.85-2.54-20.32-2.11-1.08.13-2.37-.36-3.56.14" />
      <path vectorEffect="non-scaling-stroke" d="M147.91,148.91c-1.82.34-3.06,1.82-4.77,2.38" />
      <path vectorEffect="non-scaling-stroke" d="M27.93,166.4c-1.11.22-1.59,1.06-1.99,1.99" />
      <path vectorEffect="non-scaling-stroke" d="M129.24,183.88c.44,1.64,1.67,3.34-.4,4.77" />
      <path vectorEffect="non-scaling-stroke" d="M144.74,183.49c-1.37.95-.59,2.37-.79,3.58" />
      <path vectorEffect="non-scaling-stroke" d="M146.72,137.39c-1.28,1.05-3.26-.47-4.37,1.19" />
      <path vectorEffect="non-scaling-stroke" d="M78.39,206.54c-.43.59-.89,1.18-.79,1.99" />
      <path vectorEffect="non-scaling-stroke" d="M31.11,228.39c1.85.63,3.08-1.19,4.77-1.19" />
      <path vectorEffect="non-scaling-stroke" d="M75.61,249.06c-1.24,1.32.82,2.65,0,3.97" />
      <path vectorEffect="non-scaling-stroke" d="M113.35,279.66c.98,1.28.14,2.43-.82,2.69-1.58.42-2.32-.92-2.76-2.29" />
      <path vectorEffect="non-scaling-stroke" d="M86.33,41.85c1.27,4.03-5.89,1.51-9.2,2.08-1.07.19,4.78-.17,4.63-1.12-.42-2.66,1.45-1.81-2.67-2.73" />
      <path vectorEffect="non-scaling-stroke" d="M116.53,107.18c-.56.77-.11,2.22-1.59,2.38" />
      <path vectorEffect="non-scaling-stroke" d="M173.34,172.76c-.78.56-1.93.54-2.38,1.59" />
      <path vectorEffect="non-scaling-stroke" d="M106.6,71.02c1.79.29.43,1.62.79,2.38" />
      <path vectorEffect="non-scaling-stroke" d="M81.17,37.24c1.63.96-.36,3,1.19,3.97" />
      <path vectorEffect="non-scaling-stroke" d="M63.29,189.45c-1.57.74-3.21,1.38-3.19,3.58.02,1.82.21,3.35,2.38,4.02,2.3.7,3.61-.93,4.67-2.12,1.05-1.18.95-2.99-.66-4.31-.87-.72-1.59-1.43-2.81-1.16" />
    </svg>
  );
}
