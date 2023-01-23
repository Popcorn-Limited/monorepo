import React, { forwardRef, useEffect } from "react";

interface WheelPickerProps {
  height: number;
  itemHeight: number;
  color: string;
}

export const WheelPicker = forwardRef<HTMLUListElement, WheelPickerProps>((props, ref) => {
  const { height, itemHeight, color } = props;
  const data = [
    {
      id: 1,
      value: "value1",
    },
    {
      id: 2,
      value: "value2",
    },
    {
      id: 3,
      value: "value3",
    },
    {
      id: 4,
      value: "value4",
    },
    {
      id: 5,
      value: "value5",
    },
    {
      id: 6,
      value: "value6",
    },
    {
      id: 7,
      value: "value7",
    },
  ];

  useEffect(() => {
    const divs = document.getElementsByClassName("div");

    // calculate the total height of the element by multiplying the length of data times props.itemHeight
    const totalHeight = data.length * props.itemHeight;

    // get height difference between the total height and the height of the element and divide by 2
    if (height > totalHeight) {
      const heightDiff = (height - totalHeight) / 2;
      for (let i = 0; i < divs.length; i++) {
        divs[i].setAttribute("style", `height: ${heightDiff + 20}px`);
      }
    } else {
      for (let i = 0; i < divs.length; i++) {
        divs[i].setAttribute("style", `height: 60px`);
      }
    }
  }, [props.height]);

  useEffect(() => {
    // add a scroll event listener to the ul element and add a class to the li element when the mouse is on it.
    const ul = document.getElementById("ul");
    ul.addEventListener("scroll", () => {
      const lis = document.getElementsByTagName("li");

      // use observer to check which element is in the middle of the ul as user scrolls
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          } else {
            entry.target.classList.remove("active");
          }
        });
      });

      // observe each li element and add it to the observer
      for (let i = 0; i < lis.length; i++) {
        observer.observe(lis[i]);
      }
    });
  }, []);

  return (
    <ul ref={ref} className="custom-wheelpicker" style={{ height: `${height}px` }} id="ul">
      <div className="div"></div>
      {data.map((item) => (
        <li className="flex items-center justify-between py-2" style={{ height: `${itemHeight}px`, color: `${color}` }}>
          {item.value}
        </li>
      ))}
      <div className="div"></div>
    </ul>
  );
});
