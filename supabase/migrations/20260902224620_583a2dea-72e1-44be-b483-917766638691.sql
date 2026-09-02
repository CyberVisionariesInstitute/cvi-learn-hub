WITH s(code, version, title, organization, brief, constraints, requirements, workloads, difficulty) AS (
  VALUES
  ('meridian-health','1.0.0','Meridian Regional Health Network','Meridian Regional Health Network',
   'Meridian operates four hospitals and nineteen clinics on a shared network. Clinical devices, staff laptops, and a patient portal all rely on certificates that were issued ad hoc over the last decade. Leadership wants a defensible PKI before the next regulatory audit.',
   '["Clinical devices cannot tolerate unplanned downtime","Certificate lifetimes must be auditable end to end","Offline root required by the compliance officer","Two data centers, no public cloud for private keys"]'::jsonb,
   '["Establish a documented trust hierarchy","Issue distinct certificate types for devices, services, and staff","Provide revocation visibility to clinical operations","Automate renewal for short-lived service certificates"]'::jsonb,
   '["Patient portal (public TLS)","Clinical device gateway (mTLS)","Internal service mesh","Staff VPN authentication"]'::jsonb, 3.2),
  ('northgate-pay','1.0.0','Northgate Payments','Northgate Payments',
   'Northgate processes card-present and online transactions for regional merchants. Their auditors flagged shared certificates across environments and no verifiable revocation path. You must design a segmented PKI that survives a key compromise.',
   '["Production and test trust must never overlap","HSM-backed private keys for any issuing authority","Revocation must be provable within one hour","Merchant-facing endpoints cannot break during rotation"]'::jsonb,
   '["Separate issuing authorities per environment","Define key ceremony and custody model","Design CRL and OCSP with realistic freshness","Plan a compromise-recovery path"]'::jsonb,
   '["Merchant API gateway","Settlement batch service","Internal admin console","Partner bank mTLS link"]'::jsonb, 4.1),
  ('arcweld-industrial','1.0.0','Arcweld Industrial','Arcweld Industrial',
   'Arcweld runs three plants with a mix of modern controllers and equipment that cannot be patched. Their OT network is flat. You must introduce certificate-based identity without stopping production lines.',
   '["Legacy controllers support only long-lived certificates","No internet egress from the plant floor","Change windows are four hours, once per month","Safety systems are out of scope and must remain untouched"]'::jsonb,
   '["Design a hierarchy that tolerates offline plant segments","Handle devices that cannot do automated renewal","Provide revocation without internet access","Document risk acceptance for legacy exceptions"]'::jsonb,
   '["Plant historian","Controller-to-SCADA links","Maintenance laptops","Vendor remote support gateway"]'::jsonb, 3.8),
  ('lakemoor-university','1.0.0','Lakemoor University System','Lakemoor University System',
   'Lakemoor supports thirty thousand students, federated research groups, and departments that run their own servers. Shadow certificate authorities have appeared across campus. You must design a trust model that departments will actually adopt.',
   '["Departments must retain some issuance autonomy","Federated research partners have their own trust anchors","Student-facing services need public trust","Small central operations team"]'::jsonb,
   '["Design delegated issuance with enforceable constraints","Define name constraints and policy boundaries","Plan migration away from shadow authorities","Provide self-service issuance for departments"]'::jsonb,
   '["Student portal","Research compute cluster","Departmental web servers","Campus WiFi authentication"]'::jsonb, 3.9),
  ('cascade-utility','1.0.0','Cascade Water Authority','Cascade Water Authority',
   'Cascade operates pumping and treatment sites across a wide region, many on cellular links. A recent incident showed that no one could tell which certificates were in use where. You must design a PKI with real inventory and revocation discipline.',
   '["Remote sites have intermittent connectivity","Regulatory reporting on control-system access","Field technicians replace hardware without notice","Budget prevents an HSM at every site"]'::jsonb,
   '["Build a certificate inventory model","Design issuance that tolerates intermittent links","Provide revocation checking that degrades safely","Define an enrollment process for field replacements"]'::jsonb,
   '["Remote site telemetry","Operator HMI access","Regional control center","Contractor access portal"]'::jsonb, 3.5),
  ('trellis-logistics','1.0.0','Trellis Logistics','Trellis Logistics',
   'Trellis moves freight for hundreds of customers and exchanges data with dozens of partner systems. Partner integrations use a tangle of certificates with no owner. You must design a PKI where every certificate has an accountable owner.',
   '["Partners rotate on their own schedules","Cannot mandate changes to partner infrastructure","High volume of short-lived workload certificates","Twenty-four hour operations, no maintenance window"]'::jsonb,
   '["Separate internal workload trust from partner trust","Define ownership and expiry accountability","Automate short-lived workload issuance","Design zero-downtime rotation"]'::jsonb,
   '["Partner EDI endpoints","Container tracking API","Warehouse scanners","Driver mobile application"]'::jsonb, 3.6),
  ('civic-services','1.0.0','Civic Services Agency','Civic Services Agency',
   'The agency delivers benefits and licensing services to the public and shares data with three other agencies. Public trust and records retention are both mandatory. You must design a PKI that satisfies auditors and stays operable by a small team.',
   '["Public services require publicly trusted certificates","Internal cross-agency links require private trust","Records must be retained for seven years","Two-person rule for any root operation"]'::jsonb,
   '["Split public and private trust cleanly","Design records and audit retention","Define dual-control root procedures","Provide an operable runbook for a small team"]'::jsonb,
   '["Public benefits portal","Licensing intake service","Cross-agency data exchange","Internal case management"]'::jsonb, 4.0)
), inserted AS (
  INSERT INTO public.scenario_packages (code, version, title, status, package, calibration, answer_guidance, difficulty_score)
  SELECT s.code, s.version, s.title, 'released',
         jsonb_build_object('organization', s.organization, 'brief', s.brief,
                            'constraints', s.constraints, 'requirements', s.requirements,
                            'workloads', s.workloads),
         jsonb_build_object('note','Instructor calibration to be authored per cohort.'),
         jsonb_build_object('note','Instructor answer guidance to be authored per cohort.'),
         s.difficulty
  FROM s
  RETURNING id, code, version
)
INSERT INTO public.scenario_student_views
  (scenario_package_id, scenario_code, scenario_version, organization, brief, constraints, requirements, workloads)
SELECT i.id, s.code, s.version, s.organization, s.brief, s.constraints, s.requirements, s.workloads
FROM inserted i JOIN s ON s.code = i.code AND s.version = i.version;