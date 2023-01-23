import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, forwardRef } from "react";

interface GetPopMenuProps {
  menuRef?: React.RefObject<HTMLButtonElement>;
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
      <Menu.Items className={`md:w-40 focus:outline-none gap-y-4 mt-4 flex flex-col `}>
        {options.map((option, index, { length }) => {
          return (
            <Menu.Item key={option.title}>
              {({ active }) => (
                <span className={`${option.hidden ? "hidden" : ""}`}>
                  <NavLink href={option.url}>
                    <div
                      className={`group text-left md:flex md:flex-col md:justify-center cursor-pointer last:border-0
                  ${index === 0 ? "rounded-t-3xl" : ""} 
                  ${length - 1 === index ? "rounded-b-3xl" : ""} 
                  ${active ? "text-black" : "text-primary"} `}
                      onClick={(e) => {
                        option?.onClick && option.onClick();
                      }}
                    >
                      <p
                        className={`whitespace-nowrap font-normal leading-none text-lg ${
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
