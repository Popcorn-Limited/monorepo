function AnimatedChevron() {
  return (
    <svg
      className="text-secondaryLight ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default AnimatedChevron;
