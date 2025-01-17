const SearchIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.26998 0.565796C11.2851 0.565796 14.54 3.82061 14.54 7.83577C14.54 9.56133 13.9387 11.1466 12.9346 12.3932C13.0174 12.4091 13.0936 12.4497 13.1531 12.5095L15.8746 15.2311C15.9548 15.3112 15.9998 15.42 15.9998 15.5334C15.9998 15.6468 15.9548 15.7555 15.8746 15.8357L15.2699 16.4404C15.1898 16.5206 15.081 16.5656 14.9676 16.5656C14.8542 16.5656 14.7455 16.5206 14.6653 16.4404L11.9437 13.7189C11.8838 13.6593 11.843 13.5832 11.8265 13.5004C10.5365 14.5417 8.9279 15.1084 7.26998 15.1058C3.25481 15.1058 -2.00459e-08 11.8509 0 7.83577C2.00459e-08 3.82061 3.25481 0.565796 7.26998 0.565796ZM7.26998 2.27638C4.19948 2.27638 1.71058 4.76528 1.71058 7.83577C1.71058 10.9063 4.19948 13.3952 7.26998 13.3952C10.3405 13.3952 12.8294 10.9063 12.8294 7.83577C12.8294 4.76528 10.3405 2.27638 7.26998 2.27638Z"
        fill="#000"
      />
    </svg>
  );
};

export default SearchIcon;
