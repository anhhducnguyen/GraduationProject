// import { useMemo } from "react";
// import {
//   useGetLocale,
//   useList,
//   useTranslate,
// } from "@refinedev/core";
// import { DataGrid, type GridColDef } from "@mui/x-data-grid";
// import {
//   DeleteButton,
//   EditButton,
//   List,
//   NumberField,
//   ShowButton,
//   useDataGrid,
// } from "@refinedev/mui";

// // Define the product type with the category field
// type Product = {
//   id: string;
//   name: string;
//   category: { id: string; title: string }; // Ensure category has an 'id' and 'title'
//   price: number;
// };

// export const ProductList = () => {
//   const { dataGridProps } = useDataGrid<Product>(); // Use the Product type

//   const locale = useGetLocale()();
//   const translate = useTranslate();

  
//   const { data: categoryData, isLoading: categoryLoading } = useList({
//     resource: "categories",
//     pagination: {
//       mode: "off",
//     },
//   });

//   const columns = useMemo<GridColDef[]>(
//     () => [
//       {
//         field: "name",
//         flex: 1,
//         headerName: translate("products.fields.name"),
//         minWidth: 300,
//       },
//       {
//         field: "category",
//         flex: 1,
//         headerName: translate("products.fields.category"),
//         minWidth: 200,
//         valueGetter: ({ row }: { row: Product }) => {
//           const value = row?.category?.id;
//           return value;
//         },
//         display: "flex",
//         renderCell: function render({ value }) {
//           return categoryLoading ? (
//             <>{translate("loading")}</>
//           ) : (
//             categoryData?.data?.find((item) => item.id === value)?.title ?? null
//           );
//         },
//       },
//       {
//         field: "price",
//         flex: 1,
//         headerName: translate("products.fields.price"),
//         minWidth: 100,
//         maxWidth: 150,
//         display: "flex",
//         renderCell: ({ value }) => {
//           return (
//             <NumberField
//               value={value}
//               locale={locale}
//               options={{ style: "currency", currency: "USD" }}
//             />
//           );
//         },
//       },
//       {
//         field: "actions",
//         headerName: translate("table.actions"),
//         sortable: false,
//         display: "flex",
//         renderCell: function render({ row }) {
//           return (
//             <>
//               <ShowButton hideText recordItemId={row.id} />
//               <EditButton hideText recordItemId={row.id} />
//               <DeleteButton hideText recordItemId={row.id} />
//             </>
//           );
//         },
//         align: "center",
//         headerAlign: "center",
//         minWidth: 80,
//       },
//     ],
//     [categoryLoading, categoryData, locale, translate]
//   );

//   return (
//     <List>
//       <DataGrid {...dataGridProps} columns={columns} />
//     </List>
//   );
// };


// src/pages/products/list.tsx

import { useMany } from "@refinedev/core";
import React from "react";

import { List, useDataGrid, DateField } from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export const ProductList = () => {
  const { dataGridProps } = useDataGrid();

  const { data: categories, isLoading } = useMany({
    resource: "categories",
    ids:
      dataGridProps?.rows?.map((item) => item?.category?.id).filter(Boolean) ??
      [],
    queryOptions: {
      enabled: !!dataGridProps?.rows,
    },
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: "id", headerName: "ID", type: "number" },
      { field: "name", flex: 1, headerName: "Name" },
      {
        field: "category",
        flex: 1,
        headerName: "Category",
        display: "flex",
        renderCell: ({ value }) =>
          isLoading
            ? "Loading..."
            : categories?.data?.find((item) => item.id === value?.id)?.title,
      },
      {
        field: "createdAt",
        flex: 1,
        headerName: "Created at",
        display: "flex",
        renderCell: ({ value }) => <DateField value={value} />,
      },
    ],
    [categories?.data, isLoading],
  );

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} />
    </List>
  );
};