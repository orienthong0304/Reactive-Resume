import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { Plus } from "@phosphor-icons/react";
import { CreateSmartTableDto } from "@reactive-resume/dto";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@reactive-resume/ui";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { useCreateSmartTable } from "@/client/services/smart-table";
import { useDialog } from "@/client/stores/dialog";

export const SmartTableDialog = () => {
  const { isOpen, close } = useDialog("smart-table");
  const { createSmartTable, loading } = useCreateSmartTable();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateSmartTableDto>({
    resolver: zodResolver(CreateSmartTableDto.schema),
    defaultValues: { title: "", file: undefined },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, form]);

  const onSubmit = async (values: CreateSmartTableDto) => {
    const formData = new FormData();
    formData.append("title", values.title);
    if (fileInputRef.current?.files?.[0]) {
      formData.append("file", fileInputRef.current.files[0]);
    }
    await createSmartTable(formData);
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-2.5">
                  <Plus />
                  <h2>{t`Create a new Smart Table`}</h2>
                </div>
              </DialogTitle>
              <DialogDescription>
                {t`Start by giving your Smart Table a name and uploading an Excel file.`}
              </DialogDescription>
            </DialogHeader>

            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Title`}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="file"
              control={form.control}
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>{t`Excel File`}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".xlsx"
                      onChange={(e) => {
                        onChange(e.target.files?.[0]);
                      }}
                      ref={fileInputRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {t`Create`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
