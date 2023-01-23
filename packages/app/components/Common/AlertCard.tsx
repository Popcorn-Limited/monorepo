import TextLink from "@popcorn/app/components/Common/TextLink";

export interface AlertCardLink {
  text: string;
  url: string;
  openInNewTab?: boolean;
}

interface AlertCardProps {
  title: string;
  text: string;
  links: AlertCardLink[];
}

export default function AlertCard({ title, text, links }: AlertCardProps): JSX.Element {
  return (
    <div className="bg-white border border-customRed rounded-lg flex flex-row p-8">
      <div className="ml-2">
        <p className="text-black text-2xl leading-6">{title}</p>
        <p className="text-black text-base mt-2">{text}</p>
        <div className="flex flex-row mt-6">
          {links.map((link) => (
            <TextLink
              text={link.text}
              url={link.url}
              showArrow={false}
              outsideLink={true}
              openInNewTab={link.openInNewTab}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
