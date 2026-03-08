import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToolsService } from 'src/libs/dashboard-api';
import { ToolLink } from 'src/libs/dashboard-api';

@Component({
  standalone: false,
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
})
export class AdminPanelComponent implements OnInit {
  tools: ToolLink[] = [];
  loading = false;
  showAddDialog = false;
  submitting = false;

  addForm: FormGroup;

  constructor(
    private toolsService: ToolsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
  ) {
    this.addForm = this.fb.group({
      toolName: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(300)]],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  ngOnInit(): void {
    this.loadTools();
  }

  loadTools(): void {
    this.loading = true;
    this.toolsService.getAllTools().subscribe({
      next: (res) => {
        this.tools = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tools. Is the backend running?',
        });
        this.loading = false;
      },
    });
  }

  openAddDialog(): void {
    this.addForm.reset();
    this.showAddDialog = true;
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.toolsService.addTool(this.addForm.value).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showAddDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Tool Added',
          detail: res.message ?? 'Tool added successfully.',
        });
        this.loadTools();
      },
      error: () => {
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add tool.',
        });
      },
    });
  }

  confirmDelete(tool: ToolLink): void {
    this.confirmationService.confirm({
      message: `Delete "<strong>${tool.toolName}</strong>"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteTool(tool._id),
    });
  }

  private deleteTool(id: string): void {
    this.toolsService.deleteTool(id).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: res.message,
        });
        this.tools = this.tools.filter((t) => t._id !== id);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete tool.',
        });
      },
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.addForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
