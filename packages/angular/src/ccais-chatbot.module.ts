import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CcaisChatbotComponent } from "./ccais-chatbot.component";

@NgModule({
  declarations: [CcaisChatbotComponent],
  exports: [CcaisChatbotComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CcaisChatbotModule {}
