import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export const Question = () => {
  return (
    <Paper elevation={1} sx={{ py: 3, px: 2, height: "100%" }}>
      <Stack
        direction="column"
        spacing={3}
        sx={{
          px: 1, // Padding between scrollbar and content.
          flex: 1,
          height: "100%",
          minHeight: 0,
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <Typography variant="h5" sx={{ textAlign: "center" }}>
          Problem Title
        </Typography>
        <Divider />
        <Typography variant="body2" sx={{ textAlign: "justify" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
          efficitur et massa at molestie. In pharetra facilisis pulvinar. Ut
          rutrum imperdiet lectus, a pulvinar ligula porta vel. Ut sollicitudin
          diam id metus tincidunt convallis. Etiam scelerisque diam id
          condimentum finibus. Sed viverra sem lorem, quis facilisis dui feugiat
          nec. Vivamus in accumsan nisl. Nullam finibus finibus erat, ac
          consequat nulla. Ut et metus at turpis sagittis efficitur. Nullam
          condimentum mauris et imperdiet laoreet. Praesent dapibus, risus sed
          sagittis tempus, elit ex rhoncus nibh, a congue elit orci ut urna.
          Nullam nunc est, malesuada id magna ut, consectetur volutpat massa.
          Donec dignissim orci nec fermentum ultricies.
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Example 1:
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "justify" }}>
          Aliquam sodales, odio quis sagittis dignissim, nibh ipsum tempus nibh,
          ut ullamcorper nisl quam et elit. Phasellus sagittis libero nisl,
          vitae convallis nibh tincidunt quis.
        </Typography>
        <Accordion
          sx={{
            boxShadow: "none",
            "& .MuiAccordionSummary-root": { p: 0 },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Hint 1</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Typography variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
              eget.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Paper>
  );
};
