import { Breadcrumb } from '@bcrs-shared-components/breadcrumb'
import Certify from './Certify.vue'
import ContactInfo from './ContactInfo.vue'
import DateTooltip from './DateTooltip.vue'
import DetailComment from './DetailComment.vue'
import ImportantMessage from './ImportantMessage.vue'
import NameRequestInfo from './NameRequestInfo.vue'
import OfficeAddresses from './OfficeAddresses.vue'
import Stepper from '@/components/common/Stepper.vue'
import SummaryDirectors from './SummaryDirectors.vue'
import SummaryOfficeAddresses from './SummaryOfficeAddresses.vue'
import WarningPopover from './WarningPopover.vue'

// NB: importing/exporting Directors gives us weird errors,
// possibly due to some circular dependency, so don't do it

export {
  Breadcrumb,
  Certify,
  ContactInfo,
  DateTooltip,
  DetailComment,
  ImportantMessage,
  NameRequestInfo,
  OfficeAddresses,
  Stepper,
  SummaryDirectors,
  SummaryOfficeAddresses,
  WarningPopover
}
