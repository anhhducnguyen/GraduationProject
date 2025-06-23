import React from "react";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

export const CustomTitle = () => {
  return (
    <Link
      to="/"
      style={{
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        padding: "12px 16px",
      }}
    >
      {/* <img
                src="/public/images/pka.png"
                alt="Logo"
            /> */}
      <img
        src="/images/pka.png"
        alt="Logo"
        width="300"
        height="150"
      />

      {/* <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: "black" }}
      >
        Hệ thống coi thi
      </Typography> */}
    </Link>
  );
};
