import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, forwardRef } from "react";

interface GetPopMenuProps {
  menuRef?: React.MutableRefObject<HTMLButtonElement>;
  options: Array<{
    url: string;
    title: string;
    onClick?: () => void;
    currentlySelected: boolean;
    hidden?: boolean;
  }>;
}

const DropDownComponent: React.FC<GetPopMenuProps> = ({ options, menuRef }) => {
  const router = useRouter();
  const NavLink = forwardRef<any>((props, ref) => {
    const { href, children, ...rest } = props as any;
    return (
      <Link
        href={href}
        passHref
        ref={ref}
        {...rest}
        onClick={(e) => {
          e.preventDefault();
          router.push(href);
          menuRef?.current?.click();
        }}
      >
        {children}
      </Link>
    );
  }) as any;

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className={`md:absolute mt-6 md:mt-0 md:top-8 md:w-40 md:-left-7 bg-white rounded-3xl md:shadow-md md:border-gray-200 md:border focus:outline-none `}
      >
        {options.map((option, index, { length }) => {
          return (
            <Menu.Item key={option.title}>
              {({ active }) => (
                <span className={`${option.hidden ? "hidden" : ""}`}>
                  <NavLink href={option.url}>
                    <div
                      className={`group text-left md:flex md:flex-col md:justify-center mb-4 md:mb-0 ml-2 md:ml-0 md:px-6 md:h-14 cursor-pointer md:border-b md:border-gray-200 last:border-0
                  ${index === 0 ? "rounded-t-3xl" : ""} 
                  ${length - 1 === index ? "rounded-b-3xl" : ""} 
                  ${active ? "md:bg-warmGray text-black font-medium" : "md:bg-white text-primary"} `}
                      onClick={(e) => {
                        option?.onClick && option.onClick();
                      }}
                    >
                      <p
                        className={`whitespace-nowrap leading-none text-lg ${
                          option.currentlySelected ? "font-medium" : ""
                        }`}
                      >
                        {option.title}
                      </p>
                    </div>
                  </NavLink>
                </span>
              )}
            </Menu.Item>
          );
        })}
      </Menu.Items>
    </Transition>
  );
};

export default DropDownComponent;
